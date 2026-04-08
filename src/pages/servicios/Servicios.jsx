import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';

const CATEGORIAS_COLORES = {
  Corte:        { bg:'#E8F7F2', color:'#063D2A' },
  Color:        { bg:'#EFF6FF', color:'#1E40AF' },
  Peinado:      { bg:'#F5F3FF', color:'#5B21B6' },
  Tratamiento:  { bg:'#FFF8E7', color:'#92400E' },
  Otros:        { bg:'#F1F5F9', color:'#6B9080' },
};

const formVacio = { nombre:'', categoria:'', duracion:45, precio:'', precio_a_consultar:false };

export default function Servicios() {
  const { negocio } = useNegocio();
  const [servicios, setServicios] = useState([]);
  const [categoria, setCategoria] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(formVacio);

  useEffect(() => {
    if (!negocio) return;
    fetchServicios();
  }, [negocio]);

  const fetchServicios = async () => {
    const { data } = await supabase
      .from('servicios').select('*')
      .eq('negocio_id', negocio.id).order('created_at');
    if (data) setServicios(data);
    setLoading(false);
  };

  const abrirEdicion = (s) => {
    setEditando(s.id);
    setForm({
      nombre:             s.nombre,
      categoria:          s.categoria || '',
      duracion:           s.duracion,
      precio:             s.precio || '',
      precio_a_consultar: s.precio_a_consultar || false,
    });
    setShowForm(true);
  };

  const cerrarForm = () => {
    setShowForm(false);
    setEditando(null);
    setForm(formVacio);
  };

  const guardarServicio = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);

    const payload = {
      nombre:             form.nombre,
      categoria:          form.categoria || 'General',
      duracion:           parseInt(form.duracion) || 45,
      precio:             form.precio_a_consultar ? null : parseFloat(form.precio) || null,
      precio_a_consultar: form.precio_a_consultar,
    };

    if (editando) {
      await supabase.from('servicios').update(payload).eq('id', editando);
    } else {
      await supabase.from('servicios').insert({ ...payload, negocio_id: negocio.id, activo: true });
    }

    cerrarForm();
    fetchServicios();
    setSaving(false);
  };

  const toggleActivo = async (id, activo) => {
    await supabase.from('servicios').update({ activo: !activo }).eq('id', id);
    fetchServicios();
  };

  const filtrados = servicios.filter(s =>
    categoria === 'Todos' || s.categoria === categoria
  );

  const categorias = ['Todos', ...new Set(servicios.map(s => s.categoria).filter(Boolean))];

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 32px', height:60, display:'flex', alignItems:'center' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Servicios</div>
        <div style={{ marginLeft:'auto' }}>
          <button onClick={() => { cerrarForm(); setShowForm(true); }}
            style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + Nuevo servicio
          </button>
        </div>
      </div>

      <div style={{ padding:32, display:'flex', flexDirection:'column', gap:20 }}>

        {/* Stats */}
        <div style={{ display:'flex', gap:14 }}>
          {[
            { label:'Servicios activos', value: servicios.filter(s=>s.activo).length },
            { label:'Precio medio', value: servicios.filter(s=>s.precio).length > 0
                ? Math.round(servicios.filter(s=>s.precio).reduce((a,s)=>a+s.precio,0)/servicios.filter(s=>s.precio).length) + ' EUR' : '—' },
            { label:'Duración media', value: servicios.length > 0
                ? Math.round(servicios.reduce((a,s)=>a+s.duracion,0)/servicios.length) + ' min' : '—' },
            { label:'Categorías', value: new Set(servicios.map(s=>s.categoria).filter(Boolean)).size },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 18px', flex:1 }}>
              <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:24, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form nuevo / editar */}
        {showForm && (
          <div style={{ background:'#fff', border:'1.5px solid #0A9E6E', borderRadius:14, padding:24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>
              {editando ? 'Editar servicio' : 'Nuevo servicio'}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Nombre *</div>
                <input value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})}
                  placeholder="Ej: Corte de pelo"
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none' }}/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Categoría</div>
                <input value={form.categoria} onChange={e => setForm({...form, categoria:e.target.value})}
                  placeholder="Corte, Color..."
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none' }}/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Duración (min)</div>
                <input type="number" value={form.duracion} onChange={e => setForm({...form, duracion:e.target.value})}
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none' }}/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Precio (EUR)</div>
                <input type="number" value={form.precio}
                  disabled={form.precio_a_consultar}
                  onChange={e => setForm({...form, precio:e.target.value})}
                  placeholder={form.precio_a_consultar ? 'A consultar' : '0'}
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none', opacity: form.precio_a_consultar ? 0.5 : 1 }}/>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <input type="checkbox" id="consultar" checked={form.precio_a_consultar}
                onChange={e => setForm({...form, precio_a_consultar:e.target.checked, precio:''})}
                style={{ accentColor:'#0A9E6E', width:14, height:14 }}/>
              <label htmlFor="consultar" style={{ fontSize:13, color:'#6B9080', cursor:'pointer' }}>
                Precio a consultar
              </label>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={guardarServicio} disabled={saving}
                style={{ background: saving ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar servicio'}
              </button>
              <button onClick={cerrarForm}
                style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div style={{ display:'flex', background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden', width:'fit-content' }}>
          {categorias.map(c => (
            <button key={c} onClick={() => setCategoria(c)} style={{
              padding:'7px 16px', fontSize:12.5, fontWeight:500,
              color: categoria===c ? '#fff' : '#6B9080',
              background: categoria===c ? '#0A9E6E' : 'transparent',
              border:'none', borderRight:'1px solid #D6EDE5', cursor:'pointer',
            }}>{c}</button>
          ))}
        </div>

        {/* Tabla */}
        {servicios.length > 0 ? (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 80px 100px', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
              {['Servicio','Categoría','Duración','Precio','Estado',''].map(h=>(
                <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
              ))}
            </div>
            {filtrados.map((s, i) => {
              const cat = CATEGORIAS_COLORES[s.categoria] || CATEGORIAS_COLORES.Otros;
              return (
                <div key={s.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 80px 100px', padding:'14px 20px', borderBottom: i<filtrados.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#F4FAF7'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div style={{ fontSize:13.5, fontWeight:600, color: s.activo ? '#0B1E16' : '#A8C4B8' }}>{s.nombre}</div>
                  <div><span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:cat.bg, color:cat.color }}>{s.categoria || 'General'}</span></div>
                  <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{s.duracion} min</div>
                  <div style={{ fontSize:14, fontFamily:'DM Mono, monospace', fontWeight:700, color: s.activo ? '#0A9E6E' : '#A8C4B8' }}>
                    {s.precio_a_consultar ? 'A consultar' : s.precio ? `${s.precio} EUR` : '—'}
                  </div>
                  <div>
                    <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20,
                      background: s.activo ? '#E8F7F2' : '#F1F5F9',
                      color: s.activo ? '#063D2A' : '#6B9080',
                    }}>{s.activo ? 'Activo' : 'Pausado'}</span>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    <button onClick={() => abrirEdicion(s)}
                      style={{ padding:'5px 8px', fontSize:11.5, fontWeight:600, background:'#E8F7F2', color:'#0A9E6E', border:'none', borderRadius:6, cursor:'pointer' }}>
                      Editar
                    </button>
                    <button onClick={() => toggleActivo(s.id, s.activo)}
                      style={{ padding:'5px 8px', fontSize:11.5, fontWeight:600, background:'#F4FAF7', color:'#6B9080', border:'none', borderRadius:6, cursor:'pointer' }}>
                      {s.activo ? 'Pausar' : 'Activar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'60px 40px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✂️</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Sin servicios aún</div>
            <div style={{ fontSize:13, color:'#6B9080', marginBottom:20 }}>Añade tus servicios para que los clientes puedan reservar</div>
            <button onClick={() => setShowForm(true)}
              style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'10px 24px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + Nuevo servicio
            </button>
          </div>
        )}

      </div>
    </div>
  );
}