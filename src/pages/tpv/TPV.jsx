import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function TPV() {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  const { negocio } = useNegocio();
  const isMobile = useIsMobile();
  const codigoRef = useRef(null);
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  const [reserva, setReserva] = useState(null);
  const [productos, setProductos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [propina, setPropina] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [modoEscaneo, setModoEscaneo] = useState(null);
  const [errorCodigo, setErrorCodigo] = useState('');
  const [productoManual, setProductoManual] = useState({ nombre:'', precio:'' });
  const [showManual, setShowManual] = useState(false);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [cobrado, setCobrado] = useState(false);
  const [reservaCobrada, setReservaCobrada] = useState(null);

  useEffect(() => {
    if (!negocio) return;
    fetchData();
    return () => detenerCamara();
  }, [negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    const [resRes, prodRes] = await Promise.all([
      supabase.from('reservas').select(`
        *, clientes(nombre, telefono), empleados(nombre), servicios(nombre, precio)
      `).eq('id', reservaId).single(),
      supabase.from('productos').select('*')
        .eq('negocio_id', negocio.id).eq('activo', true).order('nombre'),
    ]);

    if (resRes.data) {
      setReserva(resRes.data);
      if (resRes.data.servicios) {
        setLineas([{
          id:          'servicio',
          nombre:      resRes.data.servicios.nombre,
          precio:      resRes.data.servicios.precio || 0,
          tipo:        'servicio',
          producto_id: null,
          cantidad:    1,
          precio_unit: resRes.data.servicios.precio || 0,
        }]);
      }
    }
    if (prodRes.data) setProductos(prodRes.data);
    setLoading(false);
  };

  const activarPistola = () => {
    detenerCamara();
    setModoEscaneo('pistola');
    setErrorCodigo('');
    setCodigoBarras('');
    setTimeout(() => codigoRef.current?.focus(), 50);
  };

  const handleEscaneo = (e) => {
    if (e.key === 'Enter') {
      const codigo = codigoBarras.trim();
      if (!codigo) return;
      procesarCodigo(codigo);
      setCodigoBarras('');
      setTimeout(() => codigoRef.current?.focus(), 50);
    }
  };

  const activarCamara = async () => {
    setModoEscaneo('camara');
    setErrorCodigo('');
    setCamaraActiva(false);
    try {
      readerRef.current = new BrowserMultiFormatReader();
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (!devices || devices.length === 0) {
        setErrorCodigo('No se encontró ninguna cámara.');
        setModoEscaneo(null);
        return;
      }
      const camaraIdeal = devices.find(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('trasera') ||
        d.label.toLowerCase().includes('rear')
      ) || devices[devices.length - 1];
      setCamaraActiva(true);
      setTimeout(async () => {
        try {
          await readerRef.current.decodeFromVideoDevice(
            camaraIdeal.deviceId,
            videoRef.current,
            (result) => {
              if (result) {
                procesarCodigo(result.getText());
                if (navigator.vibrate) navigator.vibrate(100);
              }
            }
          );
        } catch (err) {
          setErrorCodigo('Error al iniciar la cámara: ' + err.message);
          setCamaraActiva(false);
        }
      }, 200);
    } catch (err) {
      setErrorCodigo('No se pudo acceder a la cámara. Comprueba los permisos.');
      setModoEscaneo(null);
    }
  };

  const detenerCamara = () => {
    if (readerRef.current) {
      try { readerRef.current.reset(); } catch {}
      readerRef.current = null;
    }
    setCamaraActiva(false);
  };

  const cerrarEscaneo = () => {
    detenerCamara();
    setModoEscaneo(null);
    setCodigoBarras('');
    setErrorCodigo('');
  };

  const procesarCodigo = (codigo) => {
    const producto = productos.find(p => p.codigo_barras === codigo);
    if (producto) {
      añadirProducto(producto);
      setErrorCodigo('');
    } else {
      setErrorCodigo(`Código "${codigo}" no encontrado en el stock.`);
    }
  };

  const añadirProducto = (producto) => {
    setLineas(prev => {
      const existente = prev.find(l => l.producto_id === producto.id);
      if (existente) {
        return prev.map(l =>
          l.producto_id === producto.id
            ? { ...l, cantidad: (l.cantidad||1)+1, precio: ((l.cantidad||1)+1) * (l.precio_unit||0) }
            : l
        );
      }
      return [...prev, {
        id:          `prod-${producto.id}-${Date.now()}`,
        nombre:      producto.nombre,
        precio:      producto.precio_venta || 0,
        tipo:        'producto',
        producto_id: producto.id,
        cantidad:    1,
        precio_unit: producto.precio_venta || 0,
      }];
    });
  };

  const añadirManual = () => {
    if (!productoManual.nombre.trim()) return;
    setLineas(prev => [...prev, {
      id:          `manual-${Date.now()}`,
      nombre:      productoManual.nombre,
      precio:      parseFloat(productoManual.precio) || 0,
      tipo:        'manual',
      producto_id: null,
      cantidad:    1,
      precio_unit: parseFloat(productoManual.precio) || 0,
    }]);
    setProductoManual({ nombre:'', precio:'' });
    setShowManual(false);
  };

  const eliminarLinea = (id) => setLineas(prev => prev.filter(l => l.id !== id));

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad < 1) return;
    setLineas(prev => prev.map(l =>
      l.id === id
        ? { ...l, cantidad, precio: cantidad * (l.precio_unit || l.precio) }
        : l
    ));
  };

  const subtotal = lineas.reduce((a, l) => a + (l.precio || 0), 0);
  const total    = subtotal + parseFloat(propina || 0);

  const cobrar = async () => {
    if (lineas.length === 0) return;
    setSaving(true);
    cerrarEscaneo();

    try {
      const { data: reservaActual } = await supabase
        .from('reservas').select('estado').eq('id', reservaId).single();
      if (reservaActual?.estado === 'completada') {
        alert('Esta reserva ya fue cobrada anteriormente.');
        setSaving(false);
        return;
      }

      const { data: tpv, error: tpvError } = await supabase
        .from('tpv').insert({
          reserva_id:  reservaId,
          negocio_id:  negocio.id,
          metodo_pago: metodoPago,
          importe:     total,
          propina:     parseFloat(propina) || 0,
        }).select().single();

      if (tpvError || !tpv) throw new Error('Error al crear el cobro.');

      await supabase.from('tpv_productos').insert(
        lineas.map(l => ({ tpv_id: tpv.id, nombre: l.nombre, precio: l.precio || 0 }))
      );

      await supabase.from('reservas').update({
        estado:       'completada',
        precio_final: total,
      }).eq('id', reservaId);

      for (const linea of lineas.filter(l => l.producto_id)) {
        const producto = productos.find(p => p.id === linea.producto_id);
        if (!producto) continue;
        const nuevoStock = Math.max(0, producto.stock_actual - (linea.cantidad || 1));
        await Promise.all([
          supabase.from('productos').update({ stock_actual: nuevoStock }).eq('id', linea.producto_id),
          supabase.from('stock_movimientos').insert({
            producto_id: linea.producto_id,
            negocio_id:  negocio.id,
            tipo:        'salida',
            cantidad:    linea.cantidad || 1,
            motivo:      `TPV reserva ${reservaId.slice(0,8)}`,
          }),
        ]);
      }

      setReservaCobrada({ ...reserva, totalCobrado: total });
      setCobrado(true);
    } catch (err) {
      alert(err.message || 'Error al cobrar.');
    }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  if (!reserva) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#EF4444' }}>Reserva no encontrada</div>
    </div>
  );

  // ── Pantalla de éxito post-cobro ──────────────────────────
  if (cobrado && reservaCobrada) {
    const telefonoRaw = reservaCobrada.clientes?.telefono?.replace(/\s/g, '') || '';
    const telefono = telefonoRaw.startsWith('+') ? telefonoRaw.slice(1) : telefonoRaw;
    const linkResena = `https://getreservly.com/resena/${negocio?.slug}/${reservaId}`;
    const mensajeWA = encodeURIComponent(
      `Hola ${reservaCobrada.clientes?.nombre || ''}! Gracias por tu visita 😊 Si tienes un momento, nos encantaría que dejaras una reseña: ${linkResena}`
    );

    return (
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:32, background:'#F4FAF7' }}>
        <div style={{ maxWidth:420, width:'100%', textAlign:'center' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'#063D2A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 20px', boxShadow:'0 0 0 8px #E8F7F2' }}>
            ✓
          </div>
          <h2 style={{ fontSize:24, fontWeight:800, color:'#0B1E16', marginBottom:8, letterSpacing:-0.5 }}>
            ¡Cobro completado!
          </h2>
          <p style={{ fontSize:14, color:'#6B9080', lineHeight:1.7, marginBottom:4 }}>
            {reservaCobrada.clientes?.nombre} · <strong style={{ color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>{reservaCobrada.totalCobrado?.toFixed(2)} EUR</strong>
          </p>
          <p style={{ fontSize:13, color:'#A8C4B8', marginBottom:28 }}>
            Reserva marcada como completada.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {telefono && (
              <a href={`https://wa.me/${telefono}?text=${mensajeWA}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', padding:'14px', background:'#25D366', color:'#fff', borderRadius:10, fontSize:14, fontWeight:700, textDecoration:'none' }}>
                💬 Pedir reseña por WhatsApp
              </a>
            )}
            <button onClick={() => {
              navigator.clipboard.writeText(linkResena);
              alert('Link copiado. Envíaselo al cliente.');
            }}
              style={{ width:'100%', padding:'12px', background:'#FFF8E7', color:'#92400E', border:'1px solid #F5E4A0', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              ⭐ Copiar link de reseña
            </button>
            <button onClick={() => navigate('/reservas')}
              style={{ width:'100%', padding:'12px', background:'#F4FAF7', color:'#6B9080', border:'1px solid #D6EDE5', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Volver a reservas →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pad = isMobile ? 16 : 32;

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => { cerrarEscaneo(); navigate('/reservas'); }}
          style={{ background:'transparent', border:'none', color:'#6B9080', fontSize:13, cursor:'pointer' }}>
          ← Volver
        </button>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Cobrar cita</div>
      </div>

      <div style={{ padding:pad, display:'flex', flexDirection: isMobile ? 'column' : 'row', gap:20, flex:1 }}>

        {/* Columna izquierda */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:14 }}>

          <div style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:12, padding:'14px 16px' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#063D2A', marginBottom:4 }}>
              {reserva.clientes?.nombre || 'Cliente'}
            </div>
            <div style={{ fontSize:12.5, color:'#0A9E6E' }}>
              {reserva.servicios?.nombre || '—'} · {reserva.fecha} · {reserva.hora_inicio?.slice(0,5)}
              {reserva.empleados && ` · ${reserva.empleados.nombre}`}
            </div>
          </div>

          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16', marginBottom:12 }}>Añadir productos</div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
              <button onClick={activarPistola}
                style={{ padding:'10px 8px', background: modoEscaneo==='pistola' ? '#063D2A' : '#F4FAF7', color: modoEscaneo==='pistola' ? '#fff' : '#6B9080', border:`1px solid ${modoEscaneo==='pistola' ? '#063D2A' : '#D6EDE5'}`, borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
                🔫 Pistola
              </button>
              <button onClick={modoEscaneo==='camara' ? cerrarEscaneo : activarCamara}
                style={{ padding:'10px 8px', background: modoEscaneo==='camara' ? '#0A9E6E' : '#F4FAF7', color: modoEscaneo==='camara' ? '#fff' : '#6B9080', border:`1px solid ${modoEscaneo==='camara' ? '#0A9E6E' : '#D6EDE5'}`, borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
                📷 Cámara
              </button>
              <button onClick={() => { cerrarEscaneo(); setShowManual(!showManual); }}
                style={{ padding:'10px 8px', background: showManual ? '#0A9E6E' : '#F4FAF7', color: showManual ? '#fff' : '#6B9080', border:`1px solid ${showManual ? '#0A9E6E' : '#D6EDE5'}`, borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
                ✏️ Manual
              </button>
            </div>

            {modoEscaneo === 'pistola' && (
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:11.5, color:'#0A9E6E', fontWeight:600, marginBottom:6 }}>
                  Apunta la pistola al código de barras del producto
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <input ref={codigoRef} value={codigoBarras}
                    onChange={e => setCodigoBarras(e.target.value)}
                    onKeyDown={handleEscaneo}
                    placeholder="Escanea el código — pulsa Enter para confirmar"
                    style={{ flex:1, padding:'8px 12px', border:'1.5px solid #0A9E6E', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                  <button onClick={cerrarEscaneo}
                    style={{ padding:'8px 12px', background:'transparent', border:'1px solid #D6EDE5', borderRadius:8, color:'#6B9080', cursor:'pointer' }}>✕</button>
                </div>
              </div>
            )}

            {modoEscaneo === 'camara' && (
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:11.5, color:'#0A9E6E', fontWeight:600, marginBottom:6 }}>
                  Apunta la cámara al código de barras
                </div>
                <div style={{ position:'relative', borderRadius:10, overflow:'hidden', background:'#000', aspectRatio:'4/3', maxHeight:260 }}>
                  <video ref={videoRef} style={{ width:'100%', height:'100%', objectFit:'cover' }} playsInline muted/>
                  {!camaraActiva && (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13 }}>
                      Iniciando cámara...
                    </div>
                  )}
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                    <div style={{ width:'60%', height:'30%', border:'2px solid #0A9E6E', borderRadius:8, opacity:0.8 }}/>
                  </div>
                </div>
                <button onClick={cerrarEscaneo}
                  style={{ width:'100%', marginTop:8, padding:'8px', background:'#FEF2F2', border:'none', borderRadius:8, color:'#EF4444', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Detener cámara
                </button>
              </div>
            )}

            {showManual && (
              <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                <input value={productoManual.nombre}
                  onChange={e=>setProductoManual({...productoManual, nombre:e.target.value})}
                  placeholder="Nombre del producto"
                  style={{ flex:2, minWidth:140, padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
                <input type="number" value={productoManual.precio}
                  onChange={e=>setProductoManual({...productoManual, precio:e.target.value})}
                  placeholder="Precio EUR"
                  style={{ flex:1, minWidth:100, padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                <button onClick={añadirManual}
                  style={{ padding:'8px 16px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Añadir
                </button>
              </div>
            )}

            {errorCodigo && (
              <div style={{ fontSize:12, color:'#EF4444', padding:'8px 12px', background:'#FEF2F2', borderRadius:8, marginBottom:10 }}>
                {errorCodigo}
              </div>
            )}

            {!modoEscaneo && !showManual && productos.length > 0 && (
              <div style={{ maxHeight:220, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                <div style={{ fontSize:11, color:'#A8C4B8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>Toca para añadir</div>
                {productos.map(p => (
                  <div key={p.id} onClick={() => añadirProducto(p)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:8, cursor:'pointer', border:'1px solid #EAF5EF' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#E8F7F2'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{p.nombre}</div>
                      {p.codigo_barras && <div style={{ fontSize:11, color:'#A8C4B8', fontFamily:'DM Mono, monospace' }}>{p.codigo_barras}</div>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:11, color: p.stock_actual > 0 ? '#6B9080' : '#EF4444' }}>
                        Stock: {p.stock_actual}
                      </span>
                      <span style={{ fontSize:13, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>
                        {p.precio_venta ? `${p.precio_venta} EUR` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha — ticket */}
        <div style={{ width: isMobile ? '100%' : 340, display:'flex', flexDirection:'column', gap:14 }}>

          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:16, flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16', marginBottom:12 }}>Ticket</div>
            {lineas.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 0', color:'#A8C4B8', fontSize:13 }}>Sin productos añadidos</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {lineas.map(l => (
                  <div key={l.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid #EAF5EF' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.nombre}</div>
                      <div style={{ fontSize:11, color:'#A8C4B8' }}>
                        {l.tipo === 'servicio' ? 'Servicio' : l.tipo === 'producto' ? 'Producto · Stock' : 'Manual'}
                      </div>
                    </div>
                    {l.tipo !== 'servicio' && (
                      <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                        <button onClick={() => actualizarCantidad(l.id, (l.cantidad||1)-1)}
                          style={{ width:22, height:22, border:'1px solid #D6EDE5', borderRadius:4, background:'#F4FAF7', color:'#6B9080', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          -
                        </button>
                        <span style={{ fontSize:13, fontFamily:'DM Mono, monospace', minWidth:20, textAlign:'center' }}>{l.cantidad||1}</span>
                        <button onClick={() => actualizarCantidad(l.id, (l.cantidad||1)+1)}
                          style={{ width:22, height:22, border:'1px solid #D6EDE5', borderRadius:4, background:'#F4FAF7', color:'#6B9080', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          +
                        </button>
                      </div>
                    )}
                    <div style={{ fontSize:14, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace', minWidth:70, textAlign:'right', flexShrink:0 }}>
                      {(l.precio||0).toFixed(2)} EUR
                    </div>
                    <button onClick={() => eliminarLinea(l.id)}
                      style={{ background:'transparent', border:'none', color:'#A8C4B8', fontSize:16, cursor:'pointer', padding:'0 2px', flexShrink:0 }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ fontSize:13, color:'#6B9080' }}>Propina (EUR)</span>
              <input type="number" value={propina} onChange={e=>setPropina(e.target.value)}
                placeholder="0"
                style={{ width:90, padding:'6px 10px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace', textAlign:'right' }}/>
            </div>

            <div style={{ borderTop:'1px solid #EAF5EF', paddingTop:12, marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B9080', marginBottom:6 }}>
                <span>Subtotal</span>
                <span style={{ fontFamily:'DM Mono, monospace' }}>{subtotal.toFixed(2)} EUR</span>
              </div>
              {parseFloat(propina) > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B9080', marginBottom:6 }}>
                  <span>Propina</span>
                  <span style={{ fontFamily:'DM Mono, monospace' }}>{parseFloat(propina).toFixed(2)} EUR</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:700, color:'#0B1E16' }}>
                <span>Total</span>
                <span style={{ fontFamily:'DM Mono, monospace', color:'#0A9E6E' }}>{total.toFixed(2)} EUR</span>
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:8 }}>Método de pago</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                {[
                  { k:'efectivo', label:'💵 Efectivo' },
                  { k:'tarjeta',  label:'💳 Tarjeta'  },
                  { k:'bizum',    label:'📱 Bizum'    },
                ].map(m => (
                  <button key={m.k} onClick={() => setMetodoPago(m.k)} style={{
                    padding:'8px 6px', fontSize:12, fontWeight:600,
                    background: metodoPago===m.k ? '#063D2A' : '#F4FAF7',
                    color:      metodoPago===m.k ? '#fff'    : '#6B9080',
                    border:     `1px solid ${metodoPago===m.k ? '#063D2A' : '#D6EDE5'}`,
                    borderRadius:8, cursor:'pointer',
                  }}>{m.label}</button>
                ))}
              </div>
            </div>

            <button onClick={cobrar} disabled={saving || lineas.length === 0}
              style={{ width:'100%', padding:'14px', background: saving || lineas.length===0 ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor: saving || lineas.length===0 ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Procesando...' : `Cobrar ${total.toFixed(2)} EUR`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}