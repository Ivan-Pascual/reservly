import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';
import { exportarExcel, exportarPDF } from '../../services/exportar';

const formVacio = {
  nombre:'', codigo_barras:'', precio_venta:'', precio_coste:'',
  stock_actual:0, stock_minimo:5, categoria:'',
};

export default function Stock() {
  const { negocio } = useNegocio();
  const isMobile = useIsMobile();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroStock, setFiltroStock] = useState('todos');
  const [showAjuste, setShowAjuste] = useState(null);
  const [ajuste, setAjuste] = useState({ tipo:'entrada', cantidad:1, motivo:'' });
  const codigoRef = useRef(null);
  const buscadorRef = useRef(null);
  const [escaneando, setEscaneando] = useState(false);

  useEffect(() => {
    if (!negocio) return;
    fetchProductos();
  }, [negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProductos = async () => {
    const { data } = await supabase
      .from('productos').select('*')
      .eq('negocio_id', negocio.id).eq('activo', true)
      .order('nombre');
    if (data) setProductos(data);
    setLoading(false);
  };

  const abrirEdicion = (p) => {
    setEditando(p.id);
    setForm({
      nombre:        p.nombre,
      codigo_barras: p.codigo_barras || '',
      precio_venta:  p.precio_venta || '',
      precio_coste:  p.precio_coste || '',
      stock_actual:  p.stock_actual || 0,
      stock_minimo:  p.stock_minimo || 5,
      categoria:     p.categoria || '',
    });
    setShowForm(true);
  };

  const cerrarForm = () => {
    setShowForm(false);
    setEditando(null);
    setForm(formVacio);
  };

  const guardarProducto = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const payload = {
      nombre:        form.nombre,
      codigo_barras: form.codigo_barras || null,
      precio_venta:  parseFloat(form.precio_venta) || null,
      precio_coste:  parseFloat(form.precio_coste) || null,
      stock_actual:  parseInt(form.stock_actual) || 0,
      stock_minimo:  parseInt(form.stock_minimo) || 0,
      categoria:     form.categoria || null,
    };
    if (editando) {
      await supabase.from('productos').update(payload).eq('id', editando);
    } else {
      await supabase.from('productos').insert({ ...payload, negocio_id: negocio.id, activo: true });
    }
    cerrarForm();
    fetchProductos();
    setSaving(false);
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto del stock?')) return;
    await supabase.from('productos').update({ activo: false }).eq('id', id);
    fetchProductos();
  };

  const guardarAjuste = async (productoId) => {
    if (!ajuste.cantidad || ajuste.cantidad <= 0) return;
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    let nuevoStock = producto.stock_actual;
    if (ajuste.tipo === 'entrada') nuevoStock += parseInt(ajuste.cantidad);
    else if (ajuste.tipo === 'salida') nuevoStock -= parseInt(ajuste.cantidad);
    else nuevoStock = parseInt(ajuste.cantidad);
    if (nuevoStock < 0) nuevoStock = 0;
    await Promise.all([
      supabase.from('productos').update({ stock_actual: nuevoStock }).eq('id', productoId),
      supabase.from('stock_movimientos').insert({
        producto_id: productoId, negocio_id: negocio.id,
        tipo: ajuste.tipo, cantidad: parseInt(ajuste.cantidad),
        motivo: ajuste.motivo || null,
      }),
    ]);
    setShowAjuste(null);
    setAjuste({ tipo:'entrada', cantidad:1, motivo:'' });
    fetchProductos();
  };

  const activarEscanerBusqueda = () => {
    setEscaneando(true);
    setTimeout(() => buscadorRef.current?.focus(), 100);
  };

  const handleCodigoBarrasBusqueda = (e) => {
    if (e.key === 'Enter') {
      const codigo = e.target.value.trim();
      const producto = productos.find(p => p.codigo_barras === codigo);
      if (producto) setBusqueda(producto.nombre);
      else setBusqueda(codigo);
      setEscaneando(false);
    }
  };

  const categorias = ['todos', ...new Set(productos.map(p => p.categoria).filter(Boolean))];

  const filtrados = productos.filter(p => {
    const matchB = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                   (p.codigo_barras || '').includes(busqueda);
    const matchC = filtroCategoria === 'todos' || p.categoria === filtroCategoria;
    const matchS = filtroStock === 'todos' ||
                   (filtroStock === 'bajo' && p.stock_actual <= p.stock_minimo && p.stock_actual > 0) ||
                   (filtroStock === 'ok'   && p.stock_actual > p.stock_minimo) ||
                   (filtroStock === 'cero' && p.stock_actual === 0);
    return matchB && matchC && matchS;
  });

  const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0).length;
  const stockCero = productos.filter(p => p.stock_actual === 0).length;
  const pad = isMobile ? 16 : 32;

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Stock</div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          {productos.length > 0 && !isMobile && (
            <>
              <button onClick={() => exportarExcel.stock(productos, negocio?.nombre)}
                style={{ padding:'7px 10px', background:'#F4FAF7', border:'1px solid #D6EDE5', borderRadius:8, fontSize:12, fontWeight:600, color:'#6B9080', cursor:'pointer' }}>
                📊 Excel
              </button>
              <button onClick={() => exportarPDF.stock(productos, negocio?.nombre)}
                style={{ padding:'7px 10px', background:'#F4FAF7', border:'1px solid #D6EDE5', borderRadius:8, fontSize:12, fontWeight:600, color:'#6B9080', cursor:'pointer' }}>
                📄 PDF
              </button>
            </>
          )}
          <button onClick={activarEscanerBusqueda}
            style={{ background:'#F4FAF7', color:'#0A9E6E', border:'1px solid #D6EDE5', padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            📷 Escanear
          </button>
          <button onClick={() => { cerrarForm(); setShowForm(true); }}
            style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + Nuevo
          </button>
        </div>
      </div>

      <div style={{ padding:pad, display:'flex', flexDirection:'column', gap:16 }}>

        {/* Stats — solo si hay productos */}
        {productos.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
            {[
              { label:'Productos',   value: productos.length },
              { label:'Stock bajo',  value: stockBajo, warning: stockBajo > 0 },
              { label:'Sin stock',   value: stockCero, danger:  stockCero > 0 },
              { label:'Valor stock', value: productos.reduce((a, p) => a + (p.precio_coste||0) * p.stock_actual, 0).toFixed(0) + ' EUR' },
            ].map(s => (
              <div key={s.label} style={{ background:'#fff', border: s.danger ? '1px solid #FECACA' : s.warning ? '1px solid #F5E4A0' : '1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
                <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color: s.danger ? '#EF4444' : s.warning ? '#F59E0B' : '#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Escáner */}
        {escaneando && (
          <div style={{ background:'#E8F7F2', border:'1.5px solid #0A9E6E', borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:18 }}>📷</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#0A9E6E', marginBottom:4 }}>Escanea el código de barras</div>
              <input ref={buscadorRef} onKeyDown={handleCodigoBarrasBusqueda}
                placeholder="Escanea o escribe el código y pulsa Enter..."
                style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
            </div>
            <button onClick={() => setEscaneando(false)}
              style={{ background:'transparent', border:'none', color:'#6B9080', fontSize:18, cursor:'pointer' }}>✕</button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div style={{ background:'#fff', border:'1.5px solid #0A9E6E', borderRadius:14, padding: isMobile ? 16 : 24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>
              {editando ? 'Editar producto' : 'Nuevo producto'}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap:10 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Nombre *</div>
                  <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})}
                    placeholder="Ej: Champú hidratante"
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>
                    Código de barras
                    <span style={{ fontSize:10, color:'#0A9E6E', marginLeft:6, fontWeight:500 }}>← pistola aquí</span>
                  </div>
                  <input ref={codigoRef} value={form.codigo_barras}
                    onChange={e=>setForm({...form, codigo_barras:e.target.value})}
                    placeholder="Escanea o escribe el código"
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Precio venta (EUR)</div>
                  <input type="number" value={form.precio_venta} onChange={e=>setForm({...form, precio_venta:e.target.value})}
                    placeholder="0.00" style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Precio coste (EUR)</div>
                  <input type="number" value={form.precio_coste} onChange={e=>setForm({...form, precio_coste:e.target.value})}
                    placeholder="0.00" style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Stock actual</div>
                  <input type="number" value={form.stock_actual} onChange={e=>setForm({...form, stock_actual:e.target.value})}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Stock mínimo</div>
                  <input type="number" value={form.stock_minimo} onChange={e=>setForm({...form, stock_minimo:e.target.value})}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Categoría</div>
                <input value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})}
                  placeholder="Ej: Champús, Tintes, Tratamientos..."
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={guardarProducto} disabled={saving}
                style={{ background: saving ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar producto'}
              </button>
              <button onClick={cerrarForm}
                style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filtros — solo si hay productos */}
        {productos.length > 0 && (
          <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap:8, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, padding:'7px 14px', flex: isMobile ? 'auto' : 1 }}>
              <span style={{ color:'#A8C4B8' }}>🔍</span>
              <input value={busqueda} onChange={e=>setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o código de barras..."
                style={{ border:'none', outline:'none', fontSize:13, color:'#0B1E16', background:'transparent', width:'100%' }}/>
            </div>
            <div style={{ display:'flex', background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden' }}>
              {[
                { k:'todos', label:'Todo'       },
                { k:'bajo',  label:'Stock bajo' },
                { k:'cero',  label:'Sin stock'  },
                { k:'ok',    label:'Stock OK'   },
              ].map(f => (
                <button key={f.k} onClick={() => setFiltroStock(f.k)} style={{
                  padding:'7px 12px', fontSize:12, fontWeight:500,
                  color: filtroStock===f.k ? '#fff' : '#6B9080',
                  background: filtroStock===f.k ? '#0A9E6E' : 'transparent',
                  border:'none', borderRight:'1px solid #D6EDE5', cursor:'pointer', whiteSpace:'nowrap',
                }}>{f.label}</button>
              ))}
            </div>
            {categorias.length > 1 && (
              <div style={{ display:'flex', background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden', flexWrap:'wrap' }}>
                {categorias.map(c => (
                  <button key={c} onClick={() => setFiltroCategoria(c)} style={{
                    padding:'7px 12px', fontSize:12, fontWeight:500,
                    color: filtroCategoria===c ? '#fff' : '#6B9080',
                    background: filtroCategoria===c ? '#0A9E6E' : 'transparent',
                    border:'none', borderRight:'1px solid #D6EDE5', cursor:'pointer',
                    textTransform:'capitalize', whiteSpace:'nowrap',
                  }}>{c === 'todos' ? 'Todas las categorías' : c}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lista productos */}
        {productos.length > 0 ? (
          isMobile ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {filtrados.map(p => {
                const stockOk   = p.stock_actual > p.stock_minimo;
                const stockCeroP = p.stock_actual === 0;
                return (
                  <div key={p.id} style={{ background:'#fff', border: stockCeroP ? '1px solid #FECACA' : !stockOk ? '1px solid #F5E4A0' : '1px solid #EAF5EF', borderRadius:12, padding:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>{p.nombre}</div>
                      <div style={{ fontSize:16, fontWeight:700, fontFamily:'DM Mono, monospace', color: stockCeroP ? '#EF4444' : !stockOk ? '#F59E0B' : '#0A9E6E' }}>
                        {p.stock_actual}
                      </div>
                    </div>
                    {p.codigo_barras && <div style={{ fontSize:11, color:'#A8C4B8', fontFamily:'DM Mono, monospace', marginBottom:4 }}>{p.codigo_barras}</div>}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, color:'#6B9080', marginBottom:10 }}>
                      <span>{p.categoria || '—'}</span>
                      <span>{p.precio_venta ? `${p.precio_venta} EUR` : '—'}</span>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => { setShowAjuste(p.id); setAjuste({ tipo:'entrada', cantidad:1, motivo:'' }); }}
                        style={{ flex:1, padding:'7px', fontSize:12, fontWeight:600, background:'#E8F7F2', color:'#0A9E6E', border:'none', borderRadius:8, cursor:'pointer' }}>
                        Ajustar stock
                      </button>
                      <button onClick={() => abrirEdicion(p)}
                        style={{ flex:1, padding:'7px', fontSize:12, fontWeight:600, background:'#F4FAF7', color:'#6B9080', border:'1px solid #D6EDE5', borderRadius:8, cursor:'pointer' }}>
                        Editar
                      </button>
                    </div>
                    {showAjuste === p.id && (
                      <div style={{ marginTop:10, background:'#F4FAF7', borderRadius:10, padding:12 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#0B1E16', marginBottom:8 }}>Ajuste de stock</div>
                        <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                          {['entrada','salida','ajuste'].map(t => (
                            <button key={t} onClick={() => setAjuste({...ajuste, tipo:t})} style={{
                              flex:1, padding:'6px', fontSize:11.5, fontWeight:600, border:'none', borderRadius:6, cursor:'pointer',
                              background: ajuste.tipo===t ? '#0A9E6E' : '#fff',
                              color: ajuste.tipo===t ? '#fff' : '#6B9080',
                            }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                          ))}
                        </div>
                        <input type="number" value={ajuste.cantidad} onChange={e=>setAjuste({...ajuste, cantidad:e.target.value})}
                          placeholder="Cantidad"
                          style={{ width:'100%', padding:'7px 10px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace', marginBottom:6 }}/>
                        <input value={ajuste.motivo} onChange={e=>setAjuste({...ajuste, motivo:e.target.value})}
                          placeholder="Motivo (opcional)"
                          style={{ width:'100%', padding:'7px 10px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', marginBottom:8 }}/>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => guardarAjuste(p.id)}
                            style={{ flex:1, padding:'7px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                            Confirmar
                          </button>
                          <button onClick={() => setShowAjuste(null)}
                            style={{ flex:1, padding:'7px', background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filtrados.length === 0 && <div style={{ padding:40, textAlign:'center', color:'#A8C4B8', fontSize:14 }}>No hay productos que coincidan</div>}
            </div>
          ) : (
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 140px', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
                {['Producto','Código','Categoría','Stock','Mín.','Precio venta',''].map(h=>(
                  <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
                ))}
              </div>
              {filtrados.map((p) => {
                const stockOk   = p.stock_actual > p.stock_minimo;
                const stockCeroP = p.stock_actual === 0;
                return (
                  <React.Fragment key={p.id}>
                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 140px', padding:'14px 20px', borderBottom:'1px solid #EAF5EF', gap:12, alignItems:'center' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#F4FAF7'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{p.nombre}</div>
                      <div style={{ fontSize:12, fontFamily:'DM Mono, monospace', color:'#A8C4B8' }}>{p.codigo_barras || '—'}</div>
                      <div style={{ fontSize:12.5, color:'#6B9080', textTransform:'capitalize' }}>{p.categoria || '—'}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontSize:14, fontWeight:700, fontFamily:'DM Mono, monospace', color: stockCeroP ? '#EF4444' : !stockOk ? '#F59E0B' : '#0A9E6E' }}>
                          {p.stock_actual}
                        </span>
                        {stockCeroP && <span style={{ fontSize:10, background:'#FEF2F2', color:'#EF4444', padding:'1px 5px', borderRadius:10, fontWeight:600 }}>Sin stock</span>}
                        {!stockCeroP && !stockOk && <span style={{ fontSize:10, background:'#FFF8E7', color:'#F59E0B', padding:'1px 5px', borderRadius:10, fontWeight:600 }}>Bajo</span>}
                      </div>
                      <div style={{ fontSize:12.5, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{p.stock_minimo}</div>
                      <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#0B1E16', fontWeight:600 }}>
                        {p.precio_venta ? `${p.precio_venta} EUR` : '—'}
                      </div>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={() => { setShowAjuste(showAjuste===p.id ? null : p.id); setAjuste({ tipo:'entrada', cantidad:1, motivo:'' }); }}
                          style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'#E8F7F2', color:'#0A9E6E', border:'none', borderRadius:6, cursor:'pointer' }}>
                          Ajustar
                        </button>
                        <button onClick={() => abrirEdicion(p)}
                          style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'#F4FAF7', color:'#6B9080', border:'none', borderRadius:6, cursor:'pointer' }}>
                          Editar
                        </button>
                        <button onClick={() => eliminarProducto(p.id)}
                          style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'#FEF2F2', color:'#EF4444', border:'none', borderRadius:6, cursor:'pointer' }}>
                          ✕
                        </button>
                      </div>
                    </div>
                    {showAjuste === p.id && (
                      <div style={{ padding:'14px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>
                            Ajuste de stock para <span style={{ color:'#0A9E6E' }}>{p.nombre}</span>
                          </div>
                          <div style={{ display:'flex', background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden' }}>
                            {['entrada','salida','ajuste'].map(t => (
                              <button key={t} onClick={() => setAjuste({...ajuste, tipo:t})} style={{
                                padding:'6px 12px', fontSize:12, fontWeight:600, border:'none', cursor:'pointer',
                                background: ajuste.tipo===t ? '#0A9E6E' : 'transparent',
                                color: ajuste.tipo===t ? '#fff' : '#6B9080',
                                borderRight:'1px solid #D6EDE5',
                              }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                            ))}
                          </div>
                          <input type="number" value={ajuste.cantidad} onChange={e=>setAjuste({...ajuste, cantidad:e.target.value})}
                            placeholder="Cantidad"
                            style={{ width:100, padding:'6px 10px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                          <input value={ajuste.motivo} onChange={e=>setAjuste({...ajuste, motivo:e.target.value})}
                            placeholder="Motivo (opcional)"
                            style={{ flex:1, minWidth:160, padding:'6px 10px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
                          <button onClick={() => guardarAjuste(p.id)}
                            style={{ padding:'6px 16px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                            Confirmar
                          </button>
                          <button onClick={() => setShowAjuste(null)}
                            style={{ padding:'6px 12px', background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {filtrados.length === 0 && <div style={{ padding:40, textAlign:'center', color:'#A8C4B8', fontSize:14 }}>No hay productos que coincidan</div>}
            </div>
          )
        ) : (
          /* Empty state con guía de primeros pasos */
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'48px 40px', textAlign:'center', maxWidth:560, margin:'0 auto', width:'100%' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📦</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#0B1E16', marginBottom:8 }}>
              Empieza a gestionar tu stock
            </div>
            <div style={{ fontSize:14, color:'#6B9080', lineHeight:1.7, marginBottom:28 }}>
              Controla el inventario de productos que usas o vendes en tu negocio — champús, tintes, tratamientos, lo que sea.
            </div>

            {/* Pasos */}
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28, textAlign:'left' }}>
              {[
                { n:'1', titulo:'Añade tus productos', desc:'Con nombre, precio y stock inicial. Puedes usar la pistola de códigos de barras.' },
                { n:'2', titulo:'Define el stock mínimo', desc:'Te avisaremos cuando un producto esté por debajo del mínimo que fijes.' },
                { n:'3', titulo:'Ajusta el stock', desc:'Cada vez que entren o salgan productos, regístralo para tener el inventario al día.' },
              ].map(p => (
                <div key={p.n} style={{ display:'flex', alignItems:'flex-start', gap:14, background:'#F4FAF7', borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'#0A9E6E', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>
                    {p.n}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16', marginBottom:2 }}>{p.titulo}</div>
                    <div style={{ fontSize:12.5, color:'#6B9080', lineHeight:1.5 }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setShowForm(true)}
              style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'12px 28px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
              + Añadir primer producto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}