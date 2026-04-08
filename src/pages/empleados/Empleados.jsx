import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';

const COLORES = ['#0A9E6E','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6'];
const formVacio = { nombre:'', email:'', telefono:'', color:'#0A9E6E', tipo_comision:'ninguna', comision_valor:0 };

export default function Empleados() {
  const { negocio } = useNegocio();
  const [empleados, setEmpleados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(formVacio);

  useEffect(() => {
    if (!negocio) return;
    fetchEmpleados();
  }, [negocio]);

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
    if (!window.confirm('¿Eliminar este empleado? Sus reservas existentes no se verán afectadas.')) return;
    await supabase.from('empleados').update({ activo: false }).eq('id', id);
    fetchEmpleados();
  };

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 32px', height:60, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Empleados</div>
        <div style={{ marginLeft:'auto' }}>
          <button onClick={() => { cerrarForm(); setShowForm(true); }}
            style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + Añadir empleado
          </button>
        </div>
      </div>

      <div style={{ padding:32, display:'flex', flexDirection:'column', gap:20 }}>

        {/* Stats */}
        <div style={{ display:'flex', gap:14 }}>
          {[
            { label:'Empleados activos', value: empleados.length },
            { label:'Con comisión',      value: empleados.filter(e=>e.tipo_comision!=='ninguna').length },
            { label:'Sin comisión',      value: empleados.filter(e=>e.tipo_comision==='ninguna').length },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 18px', flex:1 }}>
              <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form nuevo / editar */}
        {showForm && (
          <div style={{ background:'#fff', border:'1.5px solid #0A9E6E', borderRadius:14, padding:24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>
              {editando ? 'Editar empleado' : 'Nuevo empleado'}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Nombre *</div>
                <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})}
                  placeholder="Ej: Maria Garcia"
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none' }}/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Email</div>
                <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})}
                  placeholder="maria@email.com" type="email"
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none' }}/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Teléfono</div>
                <input value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})}
                  placeholder="+34 600 000 000"
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none' }}/>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Color</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {COLORES.map(c => (
                    <div key={c} onClick={() => setForm({...form, color:c})}
                      style={{ width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer',
                        border: form.color===c ? '3px solid #0B1E16' : '3px solid transparent' }}/>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Tipo comisión</div>
                <select value={form.tipo_comision} onChange={e=>setForm({...form, tipo_comision:e.target.value})}
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif' }}>
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
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none' }}/>
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {empleados.map(e => (
              <div key={e.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
                <div style={{ background: e.color + '20', padding:'20px 18px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid #EAF5EF' }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:e.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff', flexShrink:0 }}>
                    {e.nombre[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>{e.nombre}</div>
                    <div style={{ fontSize:11.5, color:'#6B9080', marginTop:2 }}>{e.email || 'Sin email'}</div>
                  </div>
                  <button onClick={() => abrirEdicion(e)}
                    style={{ background:'#E8F7F2', border:'none', color:'#0A9E6E', padding:'5px 10px', borderRadius:6, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>
                    Editar
                  </button>
                </div>
                <div style={{ padding:'14px 18px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom: e.telefono ? 8 : 0 }}>
                    <span style={{ color:'#6B9080' }}>Comisión</span>
                    <span style={{ fontWeight:600, color: e.tipo_comision==='ninguna' ? '#A8C4B8' : '#0A9E6E' }}>
                      {e.tipo_comision === 'ninguna' ? 'Sin comisión' :
                       e.tipo_comision === 'porcentaje' ? `${e.comision_valor}%` :
                       `${e.comision_valor} EUR/cita`}
                    </span>
                  </div>
                  {e.telefono && (
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                      <span style={{ color:'#6B9080' }}>Teléfono</span>
                      <span style={{ fontFamily:'DM Mono, monospace', color:'#0B1E16' }}>{e.telefono}</span>
                    </div>
                  )}
                </div>
                <div style={{ padding:'10px 18px', borderTop:'1px solid #EAF5EF' }}>
                  <button onClick={() => eliminarEmpleado(e.id)}
                    style={{ width:'100%', background:'transparent', border:'1px solid #FECACA', color:'#EF4444', padding:'6px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    Eliminar empleado
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'60px 40px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Sin empleados aún</div>
            <div style={{ fontSize:13, color:'#6B9080', marginBottom:20 }}>Añade tu primer empleado para empezar a gestionar reservas</div>
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