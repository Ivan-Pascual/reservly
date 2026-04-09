import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';

const TIPO_BONO = {
  sesiones: { label:'Pack de sesiones', bg:'#E8F7F2', color:'#063D2A', emoji:'🎯' },
  importe:  { label:'Bono de importe',  bg:'#F5F3FF', color:'#5B21B6', emoji:'💶' },
};

export default function Bonos() {
  const { negocio } = useNegocio();
  const isMobile = useIsMobile();
  const [bonos, setBonos] = useState([]);
  const [descuentos, setDescuentos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('bonos');
  const [showFormBono, setShowFormBono] = useState(false);
  const [showFormDesc, setShowFormDesc] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formBono, setFormBono] = useState({
    nombre:'', tipo:'sesiones', sesiones:'', importe:'', precio:'', servicio_id:'',
  });

  const [formDesc, setFormDesc] = useState({
    tipo:'automatico', nombre:'', codigo:'',
    porcentaje:'', importe_fijo:'',
    usos_maximos:'', fecha_limite:'',
  });

  useEffect(() => {
    if (!negocio) return;
    fetchData();
  }, [negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    const [bonosRes, descRes, serRes] = await Promise.all([
      supabase.from('bonos').select('*, servicios(nombre)')
        .eq('negocio_id', negocio.id).order('created_at', { ascending:false }),
      supabase.from('descuentos').select('*')
        .eq('negocio_id', negocio.id).order('created_at', { ascending:false }),
      supabase.from('servicios').select('id, nombre')
        .eq('negocio_id', negocio.id).eq('activo', true),
    ]);
    if (bonosRes.data)  setBonos(bonosRes.data);
    if (descRes.data)   setDescuentos(descRes.data);
    if (serRes.data)    setServicios(serRes.data);
    setLoading(false);
  };

  const guardarBono = async () => {
    if (!formBono.nombre.trim() || !formBono.precio) return;
    setSaving(true);
    const { error } = await supabase.from('bonos').insert({
      negocio_id:  negocio.id,
      nombre:      formBono.nombre,
      tipo:        formBono.tipo,
      sesiones:    formBono.tipo === 'sesiones' ? parseInt(formBono.sesiones) || null : null,
      importe:     formBono.tipo === 'importe'  ? parseFloat(formBono.importe) || null : null,
      precio:      parseFloat(formBono.precio),
      servicio_id: formBono.servicio_id || null,
      activo:      true,
    });
    if (!error) {
      setFormBono({ nombre:'', tipo:'sesiones', sesiones:'', importe:'', precio:'', servicio_id:'' });
      setShowFormBono(false);
      fetchData();
    }
    setSaving(false);
  };

  const guardarDescuento = async () => {
    if (!formDesc.nombre.trim()) return;
    if (formDesc.tipo === 'cupón' && !formDesc.codigo.trim()) {
      alert('Debes introducir un código para el cupón.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('descuentos').insert({
      negocio_id:   negocio.id,
      tipo:         formDesc.tipo,
      nombre:       formDesc.nombre,
      codigo:       formDesc.codigo || null,
      porcentaje:   formDesc.porcentaje ? parseFloat(formDesc.porcentaje) : null,
      importe_fijo: formDesc.importe_fijo ? parseFloat(formDesc.importe_fijo) : null,
      usos_maximos: formDesc.usos_maximos ? parseInt(formDesc.usos_maximos) : null,
      fecha_limite: formDesc.fecha_limite || null,
      activo:       true,
    });
    if (!error) {
      setFormDesc({ tipo:'automatico', nombre:'', codigo:'', porcentaje:'', importe_fijo:'', usos_maximos:'', fecha_limite:'' });
      setShowFormDesc(false);
      fetchData();
    }
    setSaving(false);
  };

  const toggleActivo = async (tabla, id, activo) => {
    await supabase.from(tabla).update({ activo: !activo }).eq('id', id);
    fetchData();
  };

  const eliminar = async (tabla, id) => {
    if (!window.confirm('¿Eliminar este elemento?')) return;
    await supabase.from(tabla).delete().eq('id', id);
    fetchData();
  };

  const inputStyle = {
    width:'100%', padding:'8px 12px',
    border:'1.5px solid #D6EDE5', borderRadius:8,
    fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', background:'#F4FAF7',
  };

  const pad = isMobile ? 16 : 32;

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Bonos y Descuentos</div>
        <div style={{ marginLeft:'auto' }}>
          {tab === 'bonos' ? (
            <button onClick={() => setShowFormBono(!showFormBono)}
              style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + Nuevo bono
            </button>
          ) : (
            <button onClick={() => setShowFormDesc(!showFormDesc)}
              style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + Nuevo descuento
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, display:'flex' }}>
        {[
          { id:'bonos',      label:'🎁 Bonos',      count: bonos.length },
          { id:'descuentos', label:'🏷️ Descuentos', count: descuentos.length },
        ].map(t => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'14px 16px', fontSize: isMobile ? 13 : 13.5, fontWeight:500,
            color: tab===t.id ? '#0A9E6E' : '#6B9080',
            borderBottom: tab===t.id ? '2.5px solid #0A9E6E' : '2.5px solid transparent',
            cursor:'pointer', display:'flex', alignItems:'center', gap:6,
          }}>
            {t.label}
            <span style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:20, background:'#E8F7F2', color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>{t.count}</span>
          </div>
        ))}
      </div>

      <div style={{ padding:pad, display:'flex', flexDirection:'column', gap:16 }}>

        {/* ── BONOS ── */}
        {tab === 'bonos' && (
          <>
            {showFormBono && (
              <div style={{ background:'#fff', border:'1.5px solid #0A9E6E', borderRadius:14, padding: isMobile ? 16 : 24 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:14 }}>Nuevo bono</div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Nombre *</div>
                      <input value={formBono.nombre} onChange={e=>setFormBono({...formBono, nombre:e.target.value})}
                        placeholder="Ej: Pack 5 cortes" style={inputStyle}/>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Tipo</div>
                      <select value={formBono.tipo} onChange={e=>setFormBono({...formBono, tipo:e.target.value})} style={inputStyle}>
                        <option value="sesiones">Pack de sesiones</option>
                        <option value="importe">Bono de importe</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Precio (EUR) *</div>
                      <input type="number" value={formBono.precio} onChange={e=>setFormBono({...formBono, precio:e.target.value})}
                        placeholder="130" style={{ ...inputStyle, fontFamily:'DM Mono, monospace' }}/>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:10 }}>
                    {formBono.tipo === 'sesiones' ? (
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Número de sesiones</div>
                        <input type="number" value={formBono.sesiones} onChange={e=>setFormBono({...formBono, sesiones:e.target.value})}
                          placeholder="5" style={{ ...inputStyle, fontFamily:'DM Mono, monospace' }}/>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Saldo del bono (EUR)</div>
                        <input type="number" value={formBono.importe} onChange={e=>setFormBono({...formBono, importe:e.target.value})}
                          placeholder="100" style={{ ...inputStyle, fontFamily:'DM Mono, monospace' }}/>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Servicio (opcional)</div>
                      <select value={formBono.servicio_id} onChange={e=>setFormBono({...formBono, servicio_id:e.target.value})} style={inputStyle}>
                        <option value="">Cualquier servicio</option>
                        {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, marginTop:14 }}>
                  <button onClick={guardarBono} disabled={saving}
                    style={{ background: saving ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                    {saving ? 'Guardando...' : 'Guardar bono'}
                  </button>
                  <button onClick={() => setShowFormBono(false)}
                    style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {bonos.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:14 }}>
                {bonos.map(b => {
                  const t = TIPO_BONO[b.tipo] || TIPO_BONO.sesiones;
                  return (
                    <div key={b.id} style={{ background:'#fff', border:`1px solid ${b.activo ? '#EAF5EF' : '#F1F5F9'}`, borderRadius:14, overflow:'hidden', opacity: b.activo ? 1 : 0.6 }}>
                      <div style={{ background: b.activo ? t.bg : '#F1F5F9', padding:'16px 16px', borderBottom:'1px solid #EAF5EF' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:18, marginBottom:5 }}>{t.emoji}</div>
                            <div style={{ fontSize:14, fontWeight:700, color: b.activo ? t.color : '#6B9080', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.nombre}</div>
                            <div style={{ fontSize:11.5, color:'#6B9080', marginTop:3 }}>
                              {b.tipo === 'sesiones' ? `${b.sesiones} sesiones` : `${b.importe} EUR de saldo`}
                              {b.servicios ? ` · ${b.servicios.nombre}` : ' · Cualquier servicio'}
                            </div>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0, marginLeft:10 }}>
                            <div style={{ fontSize:22, fontWeight:700, fontFamily:'DM Mono, monospace', color:'#0B1E16' }}>{b.precio}</div>
                            <div style={{ fontSize:11, color:'#6B9080' }}>EUR</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ padding:'10px 14px', display:'flex', gap:6 }}>
                        <button onClick={() => toggleActivo('bonos', b.id, b.activo)}
                          style={{ flex:1, padding:'7px', background: b.activo ? '#FFF8E7' : '#E8F7F2', color: b.activo ? '#92400E' : '#063D2A', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                          {b.activo ? 'Pausar' : 'Activar'}
                        </button>
                        <button onClick={() => eliminar('bonos', b.id)}
                          style={{ padding:'7px 12px', background:'#FEF2F2', color:'#EF4444', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'60px 40px', textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🎁</div>
                <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Sin bonos aún</div>
                <div style={{ fontSize:13, color:'#6B9080', marginBottom:20 }}>Crea bonos para fidelizar a tus clientes</div>
                <button onClick={() => setShowFormBono(true)}
                  style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'10px 24px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  + Nuevo bono
                </button>
              </div>
            )}
          </>
        )}

        {/* ── DESCUENTOS ── */}
        {tab === 'descuentos' && (
          <>
            {showFormDesc && (
              <div style={{ background:'#fff', border:'1.5px solid #0A9E6E', borderRadius:14, padding: isMobile ? 16 : 24 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:14 }}>Nuevo descuento</div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Tipo</div>
                      <select value={formDesc.tipo} onChange={e=>setFormDesc({...formDesc, tipo:e.target.value})} style={inputStyle}>
                        <option value="automatico">Automático</option>
                        <option value="cupón">Cupón de código</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Nombre *</div>
                      <input value={formDesc.nombre} onChange={e=>setFormDesc({...formDesc, nombre:e.target.value})}
                        placeholder="Ej: Primera visita, Cumpleaños..." style={inputStyle}/>
                    </div>
                  </div>
                  {formDesc.tipo === 'cupón' && (
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Código del cupón *</div>
                      <input value={formDesc.codigo} onChange={e=>setFormDesc({...formDesc, codigo:e.target.value.toUpperCase()})}
                        placeholder="Ej: BIENVENIDA20" style={{ ...inputStyle, fontFamily:'DM Mono, monospace', letterSpacing:1 }}/>
                    </div>
                  )}
                  <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Descuento %</div>
                      <input type="number" value={formDesc.porcentaje}
                        onChange={e=>setFormDesc({...formDesc, porcentaje:e.target.value, importe_fijo:''})}
                        placeholder="20" min="0" max="100" style={{ ...inputStyle, fontFamily:'DM Mono, monospace' }}/>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Importe fijo (EUR)</div>
                      <input type="number" value={formDesc.importe_fijo}
                        onChange={e=>setFormDesc({...formDesc, importe_fijo:e.target.value, porcentaje:''})}
                        placeholder="10" min="0" style={{ ...inputStyle, fontFamily:'DM Mono, monospace' }}/>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Usos máximos</div>
                      <input type="number" value={formDesc.usos_maximos}
                        onChange={e=>setFormDesc({...formDesc, usos_maximos:e.target.value})}
                        placeholder="100" min="1" style={{ ...inputStyle, fontFamily:'DM Mono, monospace' }}/>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Fecha límite</div>
                      <input type="date" value={formDesc.fecha_limite}
                        onChange={e=>setFormDesc({...formDesc, fecha_limite:e.target.value})}
                        style={{ ...inputStyle, fontFamily:'DM Mono, monospace' }}/>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, marginTop:14 }}>
                  <button onClick={guardarDescuento} disabled={saving}
                    style={{ background: saving ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                    {saving ? 'Guardando...' : 'Guardar descuento'}
                  </button>
                  <button onClick={() => setShowFormDesc(false)}
                    style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {descuentos.length > 0 ? (
              isMobile ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {descuentos.map(d => (
                    <div key={d.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:14, opacity: d.activo ? 1 : 0.6 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>{d.nombre}</div>
                        <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20,
                          background: d.tipo==='automatico' ? '#E8F7F2' : '#EFF6FF',
                          color: d.tipo==='automatico' ? '#063D2A' : '#1E40AF',
                        }}>{d.tipo === 'automatico' ? 'Auto' : 'Cupón'}</span>
                      </div>
                      <div style={{ display:'flex', gap:16, marginBottom:10 }}>
                        <div>
                          <div style={{ fontSize:10, color:'#A8C4B8', textTransform:'uppercase', marginBottom:2 }}>Descuento</div>
                          <div style={{ fontSize:14, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>
                            {d.porcentaje ? `${d.porcentaje}%` : d.importe_fijo ? `${d.importe_fijo} EUR` : '—'}
                          </div>
                        </div>
                        {d.codigo && (
                          <div>
                            <div style={{ fontSize:10, color:'#A8C4B8', textTransform:'uppercase', marginBottom:2 }}>Código</div>
                            <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#6B9080', letterSpacing:1 }}>{d.codigo}</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize:10, color:'#A8C4B8', textTransform:'uppercase', marginBottom:2 }}>Usos</div>
                          <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>
                            {d.usos_actuales || 0}{d.usos_maximos ? `/${d.usos_maximos}` : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => toggleActivo('descuentos', d.id, d.activo)}
                          style={{ flex:1, padding:'7px', background: d.activo ? '#FFF8E7' : '#E8F7F2', color: d.activo ? '#92400E' : '#063D2A', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                          {d.activo ? 'Pausar' : 'Activar'}
                        </button>
                        <button onClick={() => eliminar('descuentos', d.id)}
                          style={{ padding:'7px 14px', background:'#FEF2F2', color:'#EF4444', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
                    {['Descuento','Tipo','Código','Descuento','Usos',''].map(h => (
                      <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
                    ))}
                  </div>
                  {descuentos.map((d, i) => (
                    <div key={d.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', padding:'14px 20px', borderBottom: i<descuentos.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center', opacity: d.activo ? 1 : 0.6 }}
                      onMouseEnter={e=>e.currentTarget.style.background='#F4FAF7'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{d.nombre}</div>
                      <div>
                        <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20,
                          background: d.tipo==='automatico' ? '#E8F7F2' : '#EFF6FF',
                          color: d.tipo==='automatico' ? '#063D2A' : '#1E40AF',
                        }}>{d.tipo === 'automatico' ? 'Auto' : 'Cupón'}</span>
                      </div>
                      <div style={{ fontSize:12, fontFamily:'DM Mono, monospace', color:'#6B9080', letterSpacing:1 }}>{d.codigo || '—'}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>
                        {d.porcentaje ? `${d.porcentaje}%` : d.importe_fijo ? `${d.importe_fijo} EUR` : '—'}
                      </div>
                      <div style={{ fontSize:12, color:'#6B9080', fontFamily:'DM Mono, monospace' }}>
                        {d.usos_actuales || 0}{d.usos_maximos ? `/${d.usos_maximos}` : ''}
                      </div>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={() => toggleActivo('descuentos', d.id, d.activo)}
                          style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background: d.activo ? '#FFF8E7' : '#E8F7F2', color: d.activo ? '#92400E' : '#063D2A', border:'none', borderRadius:6, cursor:'pointer' }}>
                          {d.activo ? 'Pausar' : 'Activar'}
                        </button>
                        <button onClick={() => eliminar('descuentos', d.id)}
                          style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'#FEF2F2', color:'#EF4444', border:'none', borderRadius:6, cursor:'pointer' }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'60px 40px', textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🏷️</div>
                <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Sin descuentos aún</div>
                <div style={{ fontSize:13, color:'#6B9080', marginBottom:20 }}>Crea descuentos automáticos o cupones de código</div>
                <button onClick={() => setShowFormDesc(true)}
                  style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'10px 24px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  + Nuevo descuento
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}