import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

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

export default function FichaCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formEdit, setFormEdit] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

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
    if (resRes.data) setReservas(resRes.data);
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
    await supabase.from('clientes').update({
      nombre:   formEdit.nombre,
      telefono: formEdit.telefono,
      email:    formEdit.email,
      tag:      formEdit.tag,
    }).eq('id', id);
    setEditando(false);
    fetchData();
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
  const totalGastado = reservas.filter(r => r.estado === 'completada').reduce((a, r) => a + (r.servicios?.precio || 0), 0);
  const visitas = reservas.filter(r => r.estado === 'completada').length;
  const canceladas = reservas.filter(r => r.estado === 'cancelada').length;

  const inputStyle = {
    width: '100%', padding: '8px 12px',
    border: '1.5px solid #D6EDE5', borderRadius: 8,
    fontSize: 13, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', background: '#F4FAF7',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 32px', height:60, display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => navigate('/clientes')}
          style={{ background:'transparent', border:'1px solid #D6EDE5', color:'#6B9080', padding:'6px 12px', borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
          ← Clientes
        </button>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>{cliente.nombre}</div>
        <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:tag.bg, color:tag.color }}>{tag.label}</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={() => setEditando(!editando)}
            style={{ background: editando ? '#0A9E6E' : 'transparent', color: editando ? '#fff' : '#6B9080', border:'1px solid #D6EDE5', padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            {editando ? 'Guardando...' : 'Editar cliente'}
          </button>
          {editando && (
            <button onClick={guardarEdicion}
              style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Guardar
            </button>
          )}
        </div>
      </div>

      <div style={{ padding:32, display:'grid', gridTemplateColumns:'300px 1fr', gap:24 }}>

        {/* LEFT — Ficha */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Avatar + info */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ background:'#063D2A', padding:'24px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color:'#fff', border:'3px solid #ffffff20' }}>
                {cliente.nombre[0].toUpperCase()}
              </div>
              <div style={{ fontSize:18, fontWeight:700, color:'#fff' }}>{cliente.nombre}</div>
              <div style={{ fontSize:12, color:'#ffffff60' }}>Cliente desde {new Date(cliente.created_at).toLocaleDateString('es-ES', { month:'long', year:'numeric' })}</div>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background: tag.bg, color: tag.color }}>{tag.label}</span>
            </div>

            {/* Stats mini */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'#EAF5EF' }}>
              {[
                { val: visitas,                      label: 'Visitas' },
                { val: totalGastado + ' EUR',         label: 'Total' },
                { val: canceladas,                   label: 'Cancel.' },
              ].map(s => (
                <div key={s.label} style={{ background:'#fff', padding:'14px 10px', textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.val}</div>
                  <div style={{ fontSize:10.5, color:'#6B9080', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Info editable */}
            <div style={{ padding:'14px 20px' }}>
              {editando ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { key:'nombre',   label:'Nombre'   },
                    { key:'telefono', label:'Teléfono', mono:true },
                    { key:'email',    label:'Email',    type:'email' },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:4 }}>{f.label}</div>
                      <input value={formEdit[f.key] || ''} onChange={e => setFormEdit({ ...formEdit, [f.key]: e.target.value })}
                        type={f.type || 'text'}
                        style={{ ...inputStyle, fontFamily: f.mono ? 'DM Mono, monospace' : 'DM Sans, sans-serif' }}/>
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:4 }}>Etiqueta</div>
                    <select value={formEdit.tag} onChange={e => setFormEdit({ ...formEdit, tag: e.target.value })}
                      style={{ ...inputStyle }}>
                      <option value="nuevo">Nuevo</option>
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  {[
                    { label:'Teléfono', val: cliente.telefono, mono: true },
                    { label:'Email',    val: cliente.email },
                  ].map(f => (
                    <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #EAF5EF', gap:12 }}>
                      <div style={{ fontSize:11.5, color:'#6B9080', fontWeight:500 }}>{f.label}</div>
                      <div style={{ fontSize:13, color:'#0B1E16', fontFamily: f.mono ? 'DM Mono, monospace' : 'inherit' }}>{f.val || '—'}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Notas */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>
              Notas del negocio
            </div>
            {cliente.notas ? (
              <div style={{ marginBottom:12 }}>
                {cliente.notas.split('\n').map((n, i) => (
                  <div key={i} style={{ padding:'8px 10px', background:'#F4FAF7', borderLeft:'3px solid #0A9E6E', borderRadius:'0 6px 6px 0', marginBottom:6, fontSize:12.5, color:'#0B1E16', lineHeight:1.4 }}>
                    {n}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize:12.5, color:'#A8C4B8', marginBottom:10 }}>Sin notas aún</div>
            )}
            <textarea value={nota} onChange={e => setNota(e.target.value)}
              placeholder="Añadir nota... (alergias, preferencias...)"
              style={{ width:'100%', padding:'8px 10px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:12.5, fontFamily:'DM Sans, sans-serif', outline:'none', minHeight:70, resize:'vertical', marginBottom:8 }}/>
            <button onClick={guardarNota} disabled={guardandoNota || !nota.trim()}
              style={{ width:'100%', background: nota.trim() ? '#0A9E6E' : '#D6EDE5', color:'#fff', border:'none', padding:'8px', borderRadius:8, fontSize:12.5, fontWeight:600, cursor: nota.trim() ? 'pointer' : 'not-allowed' }}>
              {guardandoNota ? 'Guardando...' : 'Guardar nota'}
            </button>
          </div>

        </div>

        {/* RIGHT — Historial */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Proxima cita */}
          {reservas.find(r => r.estado === 'confirmada' || r.estado === 'pendiente') && (() => {
            const proxima = reservas.find(r => r.estado === 'confirmada' || r.estado === 'pendiente');
            const s = ESTADO_STYLES[proxima.estado];
            return (
              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:10, padding:'12px 16px', textAlign:'center', minWidth:64 }}>
                  <div style={{ fontSize:22, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace', lineHeight:1 }}>
                    {new Date(proxima.fecha).getDate()}
                  </div>
                  <div style={{ fontSize:10, color:'#6B9080', fontWeight:600, textTransform:'uppercase', marginTop:2 }}>
                    {new Date(proxima.fecha).toLocaleDateString('es-ES', { month:'short' })}
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>{proxima.servicios?.nombre || 'Servicio'}</div>
                  <div style={{ fontSize:12.5, color:'#6B9080', marginTop:3 }}>
                    {proxima.fecha} · {proxima.hora_inicio?.slice(0,5)} · {proxima.empleados?.nombre || 'Sin empleado'}
                  </div>
                </div>
                <span style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:20, background:s.bg, color:s.color }}>{s.label}</span>
              </div>
            );
          })()}

          {/* Historial de reservas */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>Historial de visitas</div>
                <div style={{ fontSize:12, color:'#6B9080', marginTop:1 }}>{reservas.length} reservas totales</div>
              </div>
            </div>

            {reservas.length > 0 ? (
              reservas.map((r, i) => {
                const s = ESTADO_STYLES[r.estado] || ESTADO_STYLES.confirmada;
                return (
                  <div key={r.id} style={{ display:'grid', gridTemplateColumns:'130px 1fr auto', gap:16, padding:'16px 20px', borderBottom: i < reservas.length-1 ? '1px solid #EAF5EF' : 'none', alignItems:'start' }}
                    onMouseEnter={e => e.currentTarget.style.background='#F4FAF7'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{r.fecha}</div>
                      <div style={{ fontSize:11, color:'#6B9080', fontFamily:'DM Mono, monospace' }}>{r.hora_inicio?.slice(0,5)}</div>
                      {r.empleados && (
                        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                          <div style={{ width:6, height:6, borderRadius:'50%', background: r.empleados.color || '#ccc' }}/>
                          <span style={{ fontSize:11, color:'#6B9080' }}>{r.empleados.nombre}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{r.servicios?.nombre || 'Servicio'}</div>
                      {r.notas && (
                        <div style={{ fontSize:12, color:'#6B9080', marginTop:4, fontStyle:'italic' }}>"{r.notas}"</div>
                      )}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:15, fontWeight:700, fontFamily:'DM Mono, monospace', color:'#0B1E16' }}>
                        {r.servicios?.precio ? `${r.servicios.precio} EUR` : '—'}
                      </div>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:s.bg, color:s.color, marginTop:4, display:'inline-block' }}>{s.label}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding:'40px', textAlign:'center', color:'#A8C4B8' }}>
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