import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';

const COLORES = ['#0A9E6E','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6'];
const formVacio = { nombre:'', email:'', telefono:'', color:'#0A9E6E', tipo_comision:'ninguna', comision_valor:0 };

export default function Empleados() {
  const { negocio } = useNegocio();
  const isMobile = useIsMobile();
  const [empleados, setEmpleados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [form, setForm] = useState(formVacio);

  useEffect(() => {
    if (!negocio) return;
    fetchEmpleados();
  }, [negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEmpleados = async () => {
    const { data } = await supabase
      .from('empleados').select('*')
      .eq('negocio_id', negocio.id).eq('activo', true).order('created_at');
    if (data) setEmpleados(data);
    setLoading(false);
  };

  const abrirEdicion = (e) => {
    setEditando(e.id);
    setForm({
      nombre:         e.nombre,
      email:          e.email || '',
      telefono:       e.telefono || '',
      color:          e.color || '#0A9E6E',
      tipo_comision:  e.tipo_comision || 'ninguna',
      comision_valor: e.comision_valor || 0,
    });
    setShowForm(true);
    setConfirmEliminar(null);
  };

  const cerrarForm = () => {
    setShowForm(false);
    setEditando(null);
    setForm(formVacio);
  };

  const guardarEmpleado = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const payload = {
      nombre:         form.nombre,
      email:          form.email || null,
      telefono:       form.telefono || null,
      color:          form.color,
      tipo_comision:  form.tipo_comision,
      comision_valor: parseFloat(form.comision_valor) || 0,
    };
    if (editando) {
      await supabase.from('empleados').update(payload).eq('id', editando);
    } else {
      await supabase.from('empleados').insert({ ...payload, negocio_id: negocio.id, activo: true });
    }
    cerrarForm();
    fetchEmpleados();
    setSaving(false);
  };

  const eliminarEmpleado = async (id) => {
    await supabase.from('empleados').update({ activo: false }).eq('id', id);
    setConfirmEliminar(null);
    fetchEmpleados();
  };

  const pad = isMobile ? 16 : 32;

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Empleados</div>
        <div style={{ marginLeft:'auto' }}>
          <button onClick={() => { cerrarForm(); setShowForm(true); }}
            style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + Añadir
          </button>
        </div>
      </div>

      <div style={{ padding:pad, display:'flex', flexDirection:'column', gap:16 }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : 'repeat(3,1fr)', gap:10 }}>
          {[
            { label:'Empleados activos', value: empleados.length },
            { label:'Con comisión',      value: empleados.filter(e=>e.tipo_comision!=='ninguna').length },
            { label:'Sin comisión',      value: empleados.filter(e=>e.tipo_comision==='ninguna').length },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:24, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background:'#fff', border:'1.5px solid #0A9E6E', borderRadius:14, padding: isMobile ? 16 : 24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>
              {editando ? 'Editar empleado' : 'Nuevo empleado'}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap:10 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Nombre *</div>
                  <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})}
                    placeholder="Ej: Maria Garcia"
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Email</div>
                  <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})}
                    placeholder="maria@email.com" type="email"
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Teléfono</div>
                  <input value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})}
                    placeholder="+34 600 000 000"
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap:10 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Color en agenda</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', paddingTop:4 }}>
                    {COLORES.map(c => (
                      <div key={c} onClick={() => setForm({...form, color:c})}
                        style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer',
                          border: form.color===c ? '3px solid #0B1E16' : '3px solid transparent',
                          transition:'border 0.15s' }}/>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Tipo comisión</div>
                  <select value={form.tipo_comision} onChange={e=>setForm({...form, tipo_comision:e.target.value})}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13 }}>
                    <option value="ninguna">Sin comisión</option>
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Fijo por cita (EUR)</option>
                  </select>
                </div>
                {form.tipo_comision !== 'ninguna' && (
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>
                      {form.tipo_comision === 'porcentaje' ? 'Porcentaje (%)' : 'EUR por cita'}
                    </div>
                    <input type="number" value={form.comision_valor} onChange={e=>setForm({...form, comision_valor:e.target.value})}
                      placeholder="10"
                      style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={guardarEmpleado} disabled={saving}
                style={{ background: saving ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar empleado'}
              </button>
              <button onClick={cerrarForm}
                style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Cards empleados */}
        {empleados.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
            {empleados.map(e => (
              <div key={e.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:16, overflow:'hidden', transition:'box-shadow 0.15s' }}
                onMouseEnter={ev=>ev.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.06)'}
                onMouseLeave={ev=>ev.currentTarget.style.boxShadow='none'}
              >
                {/* Header card */}
                <div style={{ background:`linear-gradient(135deg, ${e.color}15 0%, ${e.color}08 100%)`, padding:'20px 18px', display:'flex', alignItems:'center', gap:14, borderBottom:'1px solid #EAF5EF' }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:e.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff', flexShrink:0, boxShadow:`0 4px 12px ${e.color}40` }}>
                    {e.nombre[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16', marginBottom:2 }}>{e.nombre}</div>
                    <div style={{ fontSize:12, color:'#6B9080', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {e.email || e.telefono || 'Sin contacto'}
                    </div>
                  </div>
                  <button onClick={() => abrirEdicion(e)}
                    style={{ background:'#fff', border:'1px solid #D6EDE5', color:'#6B9080', padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0 }}>
                    Editar
                  </button>
                </div>

                {/* Info */}
                <div style={{ padding:'14px 18px', display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
                    <span style={{ color:'#6B9080' }}>Comisión</span>
                    <span style={{ fontWeight:600, color: e.tipo_comision==='ninguna' ? '#A8C4B8' : '#0A9E6E',
                      background: e.tipo_comision==='ninguna' ? '#F4FAF7' : '#E8F7F2',
                      padding:'2px 10px', borderRadius:20, fontSize:12 }}>
                      {e.tipo_comision === 'ninguna' ? 'Sin comisión' :
                       e.tipo_comision === 'porcentaje' ? `${e.comision_valor}%` :
                       `${e.comision_valor}€/cita`}
                    </span>
                  </div>
                  {e.telefono && (
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                      <span style={{ color:'#6B9080' }}>Teléfono</span>
                      <span style={{ fontFamily:'DM Mono, monospace', color:'#0B1E16', fontSize:12 }}>{e.telefono}</span>
                    </div>
                  )}
                </div>

                {/* Footer — eliminar con confirmación inline */}
                <div style={{ padding:'10px 18px', borderTop:'1px solid #EAF5EF' }}>
                  {confirmEliminar === e.id ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:12, color:'#6B9080', flex:1 }}>¿Confirmar eliminación?</span>
                      <button onClick={() => eliminarEmpleado(e.id)}
                        style={{ padding:'5px 12px', background:'#EF4444', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        Sí, eliminar
                      </button>
                      <button onClick={() => setConfirmEliminar(null)}
                        style={{ padding:'5px 10px', background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmEliminar(e.id)}
                      style={{ background:'transparent', border:'none', color:'#A8C4B8', fontSize:12, fontWeight:500, cursor:'pointer', padding:0 }}>
                      Dar de baja
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'60px 40px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Sin empleados aún</div>
            <div style={{ fontSize:13, color:'#6B9080', marginBottom:20 }}>Añade tu primer empleado para gestionar reservas por persona</div>
            <button onClick={() => setShowForm(true)}
              style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'10px 24px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + Añadir empleado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}