import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useNegocio } from '../../hooks/useNegocio';

const TAG_STYLES = {
  vip:      { bg:'#F5F3FF', color:'#8B5CF6', label:'⭐ VIP'   },
  regular:  { bg:'#E8F7F2', color:'#063D2A', label:'Regular'  },
  nuevo:    { bg:'#FFF8E7', color:'#92400E', label:'Nuevo'     },
  inactivo: { bg:'#F1F5F9', color:'#6B9080', label:'Inactivo' },
};

const ESTADO_STYLES = {
  confirmada: { bg:'#E8F7F2', color:'#063D2A', label:'Confirmada' },
  pendiente:  { bg:'#FFF8E7', color:'#92400E', label:'Pendiente'  },
  completada: { bg:'#F1F5F9', color:'#6B9080', label:'Completada' },
  cancelada:  { bg:'#FEF2F2', color:'#EF4444', label:'Cancelada'  },
};

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

export default function FichaCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { negocio } = useNegocio();
  const [cliente, setCliente] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [tpvData, setTpvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [editando, setEditando] = useState(false);
  const [guardandoEdit, setGuardandoEdit] = useState(false);
  const [formEdit, setFormEdit] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    const [cliRes, resRes] = await Promise.all([
      supabase.from('clientes').select('*').eq('id', id).single(),
      supabase.from('reservas').select(`
        *, servicios(nombre, precio), empleados(nombre, color)
      `).eq('cliente_id', id).order('fecha', { ascending: false }),
    ]);
    if (cliRes.data) {
      setCliente(cliRes.data);
      setFormEdit(cliRes.data);
    }
    if (resRes.data) {
      setReservas(resRes.data);
      // Fetch TPV para calcular facturación real
      const reservaIds = resRes.data.map(r => r.id);
      if (reservaIds.length > 0) {
        const { data: tpv } = await supabase
          .from('tpv').select('reserva_id, importe')
          .in('reserva_id', reservaIds);
        if (tpv) setTpvData(tpv);
      }
    }
    setLoading(false);
  };

  const guardarNota = async () => {
    if (!nota.trim()) return;
    setGuardandoNota(true);
    const notasActuales = cliente.notas || '';
    const nuevaNota = `${new Date().toLocaleDateString('es-ES')} — ${nota}`;
    const notasActualizadas = notasActuales ? `${notasActuales}\n${nuevaNota}` : nuevaNota;
    await supabase.from('clientes').update({ notas: notasActualizadas }).eq('id', id);
    setNota('');
    setGuardandoNota(false);
    fetchData();
  };

  const guardarEdicion = async () => {
    setGuardandoEdit(true);
    await supabase.from('clientes').update({
      nombre:           formEdit.nombre,
      telefono:         formEdit.telefono        || null,
      email:            formEdit.email           || null,
      tag:              formEdit.tag,
      sexo:             formEdit.sexo            || null,
      fecha_nacimiento: formEdit.fecha_nacimiento || null,
    }).eq('id', id);
    setGuardandoEdit(false);
    setEditando(false);
    fetchData();
  };

  const linkWA = () => {
    if (!cliente?.telefono) return null;
    const tel = cliente.telefono.replace(/\s/g,'').replace('+','');
    if (!tel || !/^\d+$/.test(tel)) return null;
    return `https://wa.me/${tel}`;
  };

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  if (!cliente) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cliente no encontrado</div>
    </div>
  );

  const tag = TAG_STYLES[cliente.tag] || TAG_STYLES.regular;
  const completadas    = reservas.filter(r => r.estado === 'completada');
  const canceladas     = reservas.filter(r => r.estado === 'cancelada');
  const visitas        = completadas.length;
  const totalGastado   = completadas.reduce((a, r) => {
    const tpv = tpvData.find(t => t.reserva_id === r.id);
    return a + (tpv?.importe || r.servicios?.precio || 0);
  }, 0);
  const ticketMedio    = visitas > 0 ? totalGastado / visitas : 0;
  const ultimaVisita   = completadas[0];
  const edad           = calcularEdad(cliente.fecha_nacimiento);
  const pad            = isMobile ? 16 : 32;
  const waUrl          = linkWA();

  const inputStyle = {
    width:'100%', padding:'8px 12px',
    border:'1.5px solid #D6EDE5', borderRadius:8,
    fontSize:13, fontFamily:'DM Sans, sans-serif',
    outline:'none', background:'#F4FAF7',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:10, flexWrap: isMobile ? 'wrap' : 'nowrap', minHeight:60 }}>
        <button onClick={() => navigate('/clientes')}
          style={{ background:'transparent', border:'1px solid #D6EDE5', color:'#6B9080', padding:'6px 12px', borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer', flexShrink:0 }}>
          ← Clientes
        </button>
        <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cliente.nombre}</div>
        <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:tag.bg, color:tag.color, flexShrink:0 }}>{tag.label}</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:6, flexShrink:0 }}>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'7px 12px', background:'#25D366', color:'#fff', border:'none', borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer', textDecoration:'none' }}>
              💬 WhatsApp
            </a>
          )}
          {editando ? (
            <>
              <button onClick={guardarEdicion} disabled={guardandoEdit}
                style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {guardandoEdit ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => { setEditando(false); setFormEdit(cliente); }}
                style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={() => setEditando(true)}
              style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Editar
            </button>
          )}
        </div>
      </div>

      <div style={{ padding:pad, display:'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap:20 }}>

        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Avatar + stats */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg, #063D2A 0%, #0A4D2E 100%)', padding:'24px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:8, textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color:'#fff', border:'3px solid rgba(255,255,255,0.2)', boxShadow:'0 4px 16px rgba(0,0,0,0.2)' }}>
                {cliente.nombre[0].toUpperCase()}
              </div>
              <div style={{ fontSize:17, fontWeight:700, color:'#fff' }}>{cliente.nombre}</div>
              <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.5)' }}>
                Cliente desde {new Date(cliente.created_at).toLocaleDateString('es-ES', { month:'long', year:'numeric' })}
              </div>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:tag.bg, color:tag.color }}>{tag.label}</span>
            </div>

            {/* Stats — 4 métricas */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'#EAF5EF' }}>
              {[
                { val: visitas,                         label:'Visitas',       color:'#0B1E16' },
                { val: `${totalGastado.toFixed(0)}€`,   label:'Total gastado', color:'#0A9E6E' },
                { val: `${ticketMedio.toFixed(0)}€`,    label:'Ticket medio',  color:'#0B1E16' },
                { val: canceladas.length,               label:'Canceladas',    color: canceladas.length > 0 ? '#EF4444' : '#A8C4B8' },
              ].map(s => (
                <div key={s.label} style={{ background:'#fff', padding:'12px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:700, color:s.color, fontFamily:'DM Mono, monospace', lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:10.5, color:'#6B9080', marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Última visita */}
            {ultimaVisita && (
              <div style={{ padding:'12px 16px', borderTop:'1px solid #EAF5EF', background:'#F4FAF7' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5 }}>Última visita</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{ultimaVisita.servicios?.nombre || 'Servicio'}</div>
                <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>{ultimaVisita.fecha} · {ultimaVisita.hora_inicio?.slice(0,5)}</div>
              </div>
            )}

            {/* Info de contacto */}
            <div style={{ padding:'14px 16px' }}>
              {editando ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { key:'nombre',           label:'Nombre',           type:'text',   mono:false },
                    { key:'telefono',         label:'Teléfono',         type:'text',   mono:true  },
                    { key:'email',            label:'Email',            type:'email',  mono:false },
                    { key:'fecha_nacimiento', label:'Fecha nacimiento', type:'date',   mono:true  },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:4 }}>{f.label}</div>
                      <input type={f.type} value={formEdit[f.key] || ''}
                        onChange={e => setFormEdit({...formEdit, [f.key]: e.target.value})}
                        style={{ ...inputStyle, fontFamily: f.mono ? 'DM Mono, monospace' : 'DM Sans, sans-serif' }}/>
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:4 }}>Sexo</div>
                    <select value={formEdit.sexo || ''} onChange={e=>setFormEdit({...formEdit, sexo:e.target.value})} style={inputStyle}>
                      <option value="">Sin especificar</option>
                      <option value="hombre">Hombre</option>
                      <option value="mujer">Mujer</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:4 }}>Etiqueta</div>
                    <select value={formEdit.tag || 'nuevo'} onChange={e=>setFormEdit({...formEdit, tag:e.target.value})} style={inputStyle}>
                      <option value="nuevo">Nuevo</option>
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  {[
                    { label:'Teléfono',   val: cliente.telefono,  mono: true  },
                    { label:'Email',      val: cliente.email,     mono: false },
                    { label:'Sexo',       val: cliente.sexo ? cliente.sexo.charAt(0).toUpperCase() + cliente.sexo.slice(1) : null },
                    { label:'Edad',       val: edad !== null ? `${edad} años` : null },
                    { label:'Nacimiento', val: cliente.fecha_nacimiento },
                  ].filter(f => f.val).map(f => (
                    <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #EAF5EF', gap:12 }}>
                      <div style={{ fontSize:11.5, color:'#6B9080', fontWeight:500, flexShrink:0 }}>{f.label}</div>
                      <div style={{ fontSize:13, color:'#0B1E16', fontFamily: f.mono ? 'DM Mono, monospace' : 'inherit', textAlign:'right' }}>{f.val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>
              Acciones rápidas
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <button onClick={() => navigate('/reservas')}
                style={{ width:'100%', padding:'9px 14px', background:'#063D2A', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'left' }}>
                📅 Nueva reserva para este cliente
              </button>
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display:'block', width:'100%', padding:'9px 14px', background:'#25D366', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', textDecoration:'none', textAlign:'left' }}>
                  💬 Abrir WhatsApp
                </a>
              )}
              {cliente.email && (
                <a href={`mailto:${cliente.email}`}
                  style={{ display:'block', padding:'9px 14px', background:'#F4FAF7', color:'#6B9080', border:'1px solid #D6EDE5', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', textDecoration:'none', textAlign:'left' }}>
                  ✉️ Enviar email
                </a>
              )}
            </div>
          </div>

          {/* Notas */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>
              Notas del negocio
            </div>
            {cliente.notas ? (
              <div style={{ marginBottom:10 }}>
                {cliente.notas.split('\n').map((n, i) => (
                  <div key={i} style={{ padding:'7px 10px', background:'#F4FAF7', borderLeft:'3px solid #0A9E6E', borderRadius:'0 6px 6px 0', marginBottom:5, fontSize:12.5, color:'#0B1E16', lineHeight:1.4 }}>
                    {n}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize:12.5, color:'#A8C4B8', marginBottom:8 }}>Sin notas aún</div>
            )}
            <textarea value={nota} onChange={e => setNota(e.target.value)}
              placeholder="Añadir nota... (alergias, preferencias...)"
              style={{ width:'100%', padding:'8px 10px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:12.5, fontFamily:'DM Sans, sans-serif', outline:'none', minHeight:60, resize:'vertical', marginBottom:6 }}/>
            <button onClick={guardarNota} disabled={guardandoNota || !nota.trim()}
              style={{ width:'100%', background: nota.trim() ? '#0A9E6E' : '#D6EDE5', color:'#fff', border:'none', padding:'8px', borderRadius:8, fontSize:12.5, fontWeight:600, cursor: nota.trim() ? 'pointer' : 'not-allowed' }}>
              {guardandoNota ? 'Guardando...' : 'Guardar nota'}
            </button>
          </div>
        </div>

        {/* RIGHT — Historial */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Próxima cita */}
          {(() => {
            const proxima = reservas.find(r => r.estado === 'confirmada' || r.estado === 'pendiente');
            if (!proxima) return null;
            const s = ESTADO_STYLES[proxima.estado];
            return (
              <div style={{ background:'#fff', border:'2px solid #0A9E6E', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <div style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:10, padding:'10px 14px', textAlign:'center', flexShrink:0 }}>
                  <div style={{ fontSize:22, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace', lineHeight:1 }}>
                    {new Date(proxima.fecha + 'T12:00:00').getDate()}
                  </div>
                  <div style={{ fontSize:10, color:'#6B9080', fontWeight:600, textTransform:'uppercase', marginTop:2 }}>
                    {new Date(proxima.fecha + 'T12:00:00').toLocaleDateString('es-ES', { month:'short' })}
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:3 }}>Próxima cita</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>{proxima.servicios?.nombre || 'Servicio'}</div>
                  <div style={{ fontSize:12.5, color:'#6B9080', marginTop:3 }}>
                    {proxima.fecha} · {proxima.hora_inicio?.slice(0,5)}{proxima.empleados ? ` · ${proxima.empleados.nombre}` : ''}
                  </div>
                </div>
                <span style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:20, background:s.bg, color:s.color, flexShrink:0 }}>{s.label}</span>
              </div>
            );
          })()}

          {/* Historial completo */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAF5EF', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>Historial de visitas</div>
                <div style={{ fontSize:12, color:'#6B9080', marginTop:1 }}>{reservas.length} reservas · {visitas} completadas</div>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>
                {totalGastado.toFixed(2)} EUR
              </div>
            </div>

            {reservas.length > 0 ? reservas.map((r, i) => {
              const s = ESTADO_STYLES[r.estado] || ESTADO_STYLES.confirmada;
              const tpv = tpvData.find(t => t.reserva_id === r.id);
              const precio = tpv?.importe || r.servicios?.precio;
              return isMobile ? (
                <div key={r.id} style={{ padding:'12px 16px', borderBottom: i<reservas.length-1?'1px solid #EAF5EF':'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                    <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{r.servicios?.nombre || 'Servicio'}</div>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:s.bg, color:s.color }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize:12, color:'#6B9080' }}>
                    {r.fecha} · {r.hora_inicio?.slice(0,5)}{r.empleados ? ` · ${r.empleados.nombre}` : ''}
                  </div>
                  {precio && (
                    <div style={{ fontSize:13, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace', marginTop:4 }}>
                      {precio} EUR
                    </div>
                  )}
                </div>
              ) : (
                <div key={r.id}
                  style={{ display:'grid', gridTemplateColumns:'130px 1fr auto', gap:16, padding:'14px 18px', borderBottom: i<reservas.length-1?'1px solid #EAF5EF':'none', alignItems:'start' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#F4FAF7'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{r.fecha}</div>
                    <div style={{ fontSize:11, color:'#6B9080', fontFamily:'DM Mono, monospace' }}>{r.hora_inicio?.slice(0,5)}</div>
                    {r.empleados && (
                      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:r.empleados.color||'#ccc' }}/>
                        <span style={{ fontSize:11, color:'#6B9080' }}>{r.empleados.nombre}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{r.servicios?.nombre || 'Servicio'}</div>
                    {r.notas && <div style={{ fontSize:12, color:'#6B9080', marginTop:4, fontStyle:'italic' }}>"{r.notas}"</div>}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:14, fontWeight:700, fontFamily:'DM Mono, monospace', color: precio ? '#0A9E6E' : '#A8C4B8' }}>
                      {precio ? `${precio} EUR` : '—'}
                    </div>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:s.bg, color:s.color, marginTop:4, display:'inline-block' }}>{s.label}</span>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding:40, textAlign:'center', color:'#A8C4B8' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📅</div>
                <div style={{ fontSize:14 }}>Sin reservas aún</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}