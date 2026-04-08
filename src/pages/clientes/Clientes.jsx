import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useNavigate } from 'react-router-dom';

const TAG_STYLES = {
  vip:      { bg:'#F5F3FF', color:'#8B5CF6', label:'⭐ VIP'  },
  regular:  { bg:'#E8F7F2', color:'#063D2A', label:'Regular' },
  nuevo:    { bg:'#FFF8E7', color:'#92400E', label:'Nuevo'   },
  inactivo: { bg:'#F1F5F9', color:'#6B9080', label:'Inactivo'},
};

const POR_PAGINA = 25;

export default function Clientes() {
  const { negocio } = useNegocio();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', tag: 'nuevo', notas: '',
  });

  useEffect(() => {
    if (!negocio) return;
    fetchClientes();
  }, [negocio]);

  const fetchClientes = async () => {
    const { data } = await supabase
      .from('clientes').select('*')
      .eq('negocio_id', negocio.id)
      .order('created_at', { ascending: false });
    if (data) setClientes(data);
    setLoading(false);
  };

  const guardarCliente = async () => {
    if (!form.nombre.trim()) return;
    const { error } = await supabase.from('clientes').insert({
      ...form, negocio_id: negocio.id,
    });
    if (!error) {
      setForm({ nombre:'', email:'', telefono:'', tag:'nuevo', notas:'' });
      setShowForm(false);
      fetchClientes();
    }
  };

  const filtrados = clientes.filter(c => {
    const matchB = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                   (c.telefono || '').includes(busqueda);
    const matchF = filtro === 'todos' || c.tag === filtro;
    return matchB && matchF;
  });

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados = filtrados.slice((pagina-1)*POR_PAGINA, pagina*POR_PAGINA);

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 32px', height:60, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Clientes</div>
        <div style={{ marginLeft:'auto' }}>
          <button onClick={() => setShowForm(!showForm)}
            style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + Añadir cliente
          </button>
        </div>
      </div>

      <div style={{ padding:32, display:'flex', flexDirection:'column', gap:20 }}>

        {/* Stats */}
        <div style={{ display:'flex', gap:14 }}>
          {[
            { label:'Total clientes', value: clientes.length },
            { label:'VIP',            value: clientes.filter(c=>c.tag==='vip').length },
            { label:'Nuevos',         value: clientes.filter(c=>c.tag==='nuevo').length },
            { label:'Inactivos',      value: clientes.filter(c=>c.tag==='inactivo').length },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 18px', flex:1 }}>
              <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background:'#fff', border:'1.5px solid #0A9E6E', borderRadius:14, padding:24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>Nuevo cliente</div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Nombre *</div>
                <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})}
                  placeholder="Ej: Carmen Lopez"
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none' }}/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Teléfono</div>
                <input value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})}
                  placeholder="+34 600 000 000"
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none' }}/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Email</div>
                <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})}
                  placeholder="cliente@email.com" type="email"
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none' }}/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Etiqueta</div>
                <select value={form.tag} onChange={e=>setForm({...form, tag:e.target.value})}
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif' }}>
                  <option value="nuevo">Nuevo</option>
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Notas</div>
              <textarea value={form.notas} onChange={e=>setForm({...form, notas:e.target.value})}
                placeholder="Alergias, preferencias, notas importantes..."
                style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', minHeight:70, resize:'vertical' }}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={guardarCliente}
                style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Guardar cliente
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, padding:'7px 14px', width:260 }}>
            <span style={{ color:'#A8C4B8' }}>🔍</span>
            <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              placeholder="Buscar cliente..."
              style={{ border:'none', outline:'none', fontSize:13, color:'#0B1E16', background:'transparent', width:'100%' }}/>
          </div>
          <div style={{ display:'flex', background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden' }}>
            {['todos','vip','regular','nuevo','inactivo'].map(f => (
              <button key={f} onClick={() => { setFiltro(f); setPagina(1); }} style={{
                padding:'7px 14px', fontSize:12.5, fontWeight:500,
                color: filtro===f ? '#fff' : '#6B9080',
                background: filtro===f ? '#0A9E6E' : 'transparent',
                border:'none', borderRight:'1px solid #D6EDE5', cursor:'pointer',
                textTransform:'capitalize',
              }}>{f === 'todos' ? 'Todos' : TAG_STYLES[f]?.label}</button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        {clientes.length > 0 ? (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2.5fr 1.5fr 1fr 1fr 80px', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
              {['Cliente','Teléfono','Email','Etiqueta',''].map(h=>(
                <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
              ))}
            </div>
            {paginados.map((c, i) => {
              const t = TAG_STYLES[c.tag] || TAG_STYLES.regular;
              return (
                <div key={c.id} style={{ display:'grid', gridTemplateColumns:'2.5fr 1.5fr 1fr 1fr 80px', padding:'14px 20px', borderBottom: i<paginados.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center', cursor:'pointer' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#F4FAF7'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {c.nombre[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{c.nombre}</div>
                  </div>
                  <div style={{ fontSize:12.5, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{c.telefono || '—'}</div>
                  <div style={{ fontSize:12.5, color:'#6B9080' }}>{c.email || '—'}</div>
                  <div><span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:t.bg, color:t.color }}>{t.label}</span></div>
                  <button onClick={() => navigate(`/clientes/${c.id}`)}
                    style={{ padding:'5px 10px', fontSize:11.5, fontWeight:600, background:'#E8F7F2', color:'#0A9E6E', border:'none', borderRadius:6, cursor:'pointer' }}>
                    Ver ficha
                  </button>
                </div>
              );
            })}
            {filtrados.length === 0 && (
              <div style={{ padding:40, textAlign:'center', color:'#A8C4B8', fontSize:14 }}>
                No hay clientes que coincidan
              </div>
            )}
          </div>
        ) : (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'60px 40px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>👤</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Sin clientes aún</div>
            <div style={{ fontSize:13, color:'#6B9080', marginBottom:20 }}>Los clientes aparecerán aquí cuando hagan su primera reserva</div>
            <button onClick={() => setShowForm(true)}
              style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'10px 24px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + Añadir cliente
            </button>
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:12, color:'#A8C4B8' }}>
              {filtrados.length} clientes · mostrando {filtrados.length > 0 ? (pagina-1)*POR_PAGINA+1 : 0}–{Math.min(pagina*POR_PAGINA, filtrados.length)}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => setPagina(p => Math.max(1, p-1))} disabled={pagina===1}
                style={{ padding:'6px 12px', border:'1px solid #D6EDE5', borderRadius:8, background: pagina===1 ? '#F4FAF7' : '#fff', color: pagina===1 ? '#A8C4B8' : '#6B9080', fontSize:12, fontWeight:600, cursor: pagina===1 ? 'not-allowed' : 'pointer' }}>
                ← Anterior
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPagina(p)}
                  style={{ padding:'6px 10px', border:'1px solid #D6EDE5', borderRadius:8, background: pagina===p ? '#0A9E6E' : '#fff', color: pagina===p ? '#fff' : '#6B9080', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPagina(p => Math.min(totalPaginas, p+1))} disabled={pagina===totalPaginas}
                style={{ padding:'6px 12px', border:'1px solid #D6EDE5', borderRadius:8, background: pagina===totalPaginas ? '#F4FAF7' : '#fff', color: pagina===totalPaginas ? '#A8C4B8' : '#6B9080', fontSize:12, fontWeight:600, cursor: pagina===totalPaginas ? 'not-allowed' : 'pointer' }}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        <div style={{ fontSize:12, color:'#A8C4B8' }}>{filtrados.length} clientes</div>
      </div>
    </div>
  );
}