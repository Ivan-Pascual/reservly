import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

const METODOS = [
  { id: 'efectivo', emoji: '💵', label: 'Efectivo' },
  { id: 'tarjeta',  emoji: '💳', label: 'Tarjeta'  },
  { id: 'bizum',    emoji: '📱', label: 'Bizum'     },
  { id: 'bono',     emoji: '🎁', label: 'Bono'      },
];

const PROPINAS_RAPIDAS = [2, 5, 10];

export default function TPV() {
  const { reservaId } = useParams();
  const navigate = useNavigate();

  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [cobrado, setCobrado] = useState(false);

  const [metodo, setMetodo] = useState('efectivo');
  const [propina, setPropina] = useState(0);
  const [propinaTxt, setPropinaTxt] = useState('');
  const [enviarFactura, setEnviarFactura] = useState(true);
  const [descuento, setDescuento] = useState(0);
  const [notaTPV, setNotaTPV] = useState('');
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [productoForm, setProductoForm] = useState({ nombre: '', precio: '' });

  useEffect(() => {
    fetchReserva();
  }, [reservaId]);

  const fetchReserva = async () => {
    const { data } = await supabase
      .from('reservas')
      .select(`
        *,
        clientes(id, nombre, email, telefono),
        empleados(nombre, color),
        servicios(nombre, precio, duracion)
      `)
      .eq('id', reservaId)
      .single();

    if (data) {
      // Seguridad: no permitir cobrar una reserva ya completada o cancelada
      if (data.estado === 'completada') {
        alert('Esta reserva ya ha sido cobrada.');
        navigate('/reservas');
        return;
      }
      if (data.estado === 'cancelada') {
        alert('No se puede cobrar una reserva cancelada.');
        navigate('/reservas');
        return;
      }
      setReserva(data);

      // Verificar si ya tiene TPV registrado
      const { data: tpvExistente } = await supabase
        .from('tpv')
        .select('id')
        .eq('reserva_id', reservaId)
        .single();

      if (tpvExistente) {
        alert('Esta reserva ya tiene un cobro registrado.');
        navigate('/reservas');
        return;
      }
    }
    setLoading(false);
  };

  const precioServicio = reserva?.servicios?.precio || 0;
  const totalProductos = productosVendidos.reduce((a, p) => a + parseFloat(p.precio || 0), 0);
  const subtotal = precioServicio + totalProductos;
  const descuentoImporte = Math.min(descuento, subtotal); // no puede ser mayor al subtotal
  const totalSinPropina = Math.max(0, subtotal - descuentoImporte);
  const total = totalSinPropina + propina;

  const añadirProducto = () => {
    if (!productoForm.nombre.trim() || !productoForm.precio) return;
    setProductosVendidos([...productosVendidos, {
      nombre: productoForm.nombre,
      precio: parseFloat(productoForm.precio),
    }]);
    setProductoForm({ nombre: '', precio: '' });
  };

  const cobrar = async () => {
    if (procesando || cobrado) return;

    // Validaciones de seguridad
    if (total < 0) {
      alert('El total no puede ser negativo.');
      return;
    }
    if (!metodo) {
      alert('Selecciona un método de pago.');
      return;
    }
    if (descuentoImporte > subtotal) {
      alert('El descuento no puede ser mayor al subtotal.');
      return;
    }

    setProcesando(true);

    try {
      // 1. Verificar de nuevo que la reserva no está completada (doble check)
      const { data: reservaActual } = await supabase
        .from('reservas')
        .select('estado')
        .eq('id', reservaId)
        .single();

      if (reservaActual?.estado === 'completada') {
        alert('Esta reserva ya fue cobrada por otro usuario.');
        navigate('/reservas');
        return;
      }

      // 2. Registrar el TPV
      const { data: tpvData, error: tpvError } = await supabase
        .from('tpv')
        .insert({
          reserva_id:      reservaId,
          negocio_id:      reserva.negocio_id,
          metodo_pago:     metodo,
          importe:         total,
          propina:         propina,
          factura_enviada: enviarFactura,
        })
        .select()
        .single();

      if (tpvError) throw new Error('Error al registrar el cobro: ' + tpvError.message);

      // 3. Registrar productos vendidos
      if (productosVendidos.length > 0) {
        const { error: prodError } = await supabase
          .from('tpv_productos')
          .insert(productosVendidos.map(p => ({
            tpv_id: tpvData.id,
            nombre: p.nombre,
            precio: p.precio,
          })));
        if (prodError) throw new Error('Error al registrar productos: ' + prodError.message);
      }

      // 4. Marcar la reserva como completada y guardar precio final
      const { error: resError } = await supabase
        .from('reservas')
        .update({
          estado:       'completada',
          precio_final: total,
          notas:        notaTPV || reserva.notas,
        })
        .eq('id', reservaId);

      if (resError) throw new Error('Error al actualizar la reserva: ' + resError.message);

      setCobrado(true);

    } catch (err) {
      alert(err.message || 'Error al procesar el cobro. Inténtalo de nuevo.');
      setProcesando(false);
    }
  };

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  if (!reserva) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Reserva no encontrada</div>
    </div>
  );

  // Pantalla de cobro exitoso
  if (cobrado) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'#F4FAF7', flexDirection:'column', gap:20, padding:40 }}>
      <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:20, padding:'48px 40px', textAlign:'center', maxWidth:420, width:'100%' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#E8F7F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 20px' }}>✓</div>
        <h2 style={{ fontSize:24, fontWeight:700, color:'#0B1E16', marginBottom:8 }}>Cobro registrado</h2>
        <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>
          {reserva.clientes?.nombre} · {total.toFixed(2)} EUR · {metodo}
        </p>
        <div style={{ background:'#F4FAF7', borderRadius:12, padding:16, marginBottom:24, textAlign:'left' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0' }}>
            <span style={{ color:'#6B9080' }}>Servicio</span>
            <span style={{ fontWeight:600 }}>{precioServicio.toFixed(2)} EUR</span>
          </div>
          {totalProductos > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0' }}>
              <span style={{ color:'#6B9080' }}>Productos</span>
              <span style={{ fontWeight:600 }}>{totalProductos.toFixed(2)} EUR</span>
            </div>
          )}
          {descuentoImporte > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0' }}>
              <span style={{ color:'#6B9080' }}>Descuento</span>
              <span style={{ fontWeight:600, color:'#EF4444' }}>-{descuentoImporte.toFixed(2)} EUR</span>
            </div>
          )}
          {propina > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0' }}>
              <span style={{ color:'#6B9080' }}>Propina</span>
              <span style={{ fontWeight:600, color:'#0A9E6E' }}>{propina.toFixed(2)} EUR</span>
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, padding:'8px 0 0', borderTop:'1px solid #EAF5EF', marginTop:6 }}>
            <span style={{ fontWeight:700 }}>Total</span>
            <span style={{ fontWeight:700, color:'#0A9E6E' }}>{total.toFixed(2)} EUR</span>
          </div>
        </div>
        {enviarFactura && (
          <div style={{ background:'#EFF6FF', borderRadius:8, padding:'10px 14px', marginBottom:20, fontSize:12.5, color:'#1E40AF' }}>
            📧 Factura enviada a {reserva.clientes?.email || 'cliente'}
          </div>
        )}
        <button onClick={() => navigate('/reservas')}
          style={{ width:'100%', background:'#0A9E6E', color:'#fff', border:'none', padding:'12px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
          Volver a reservas
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 32px', height:60, display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => navigate('/reservas')}
          style={{ background:'transparent', border:'1px solid #D6EDE5', color:'#6B9080', padding:'6px 12px', borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
          ← Volver
        </button>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Cobrar cita</div>
        <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:8, padding:'4px 12px', fontSize:12, color:'#92400E', fontWeight:600 }}>
          ⚠️ No cierres esta pantalla hasta completar el cobro
        </div>
      </div>

      <div style={{ padding:32, display:'grid', gridTemplateColumns:'1fr 380px', gap:24 }}>

        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Resumen cita */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>Resumen de la cita</div>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:'#E8F7F2', color:'#063D2A' }}>
                {reserva.fecha} · {reserva.hora_inicio?.slice(0,5)}
              </span>
            </div>
            <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {reserva.clientes?.nombre?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>{reserva.clientes?.nombre || 'Cliente'}</div>
                <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>{reserva.clientes?.email} · {reserva.clientes?.telefono}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, color:'#6B9080' }}>Empleado</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{reserva.empleados?.nombre || '—'}</div>
              </div>
            </div>

            {/* Servicio */}
            <div style={{ borderTop:'1px solid #EAF5EF', padding:'14px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{reserva.servicios?.nombre || 'Servicio'}</div>
                  <div style={{ fontSize:11.5, color:'#6B9080', marginTop:2 }}>{reserva.servicios?.duracion} min</div>
                </div>
                <div style={{ fontSize:16, fontWeight:700, fontFamily:'DM Mono, monospace' }}>
                  {precioServicio.toFixed(2)} EUR
                </div>
              </div>
            </div>
          </div>

          {/* Productos vendidos */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', fontSize:14, fontWeight:700, color:'#0B1E16' }}>
              Productos vendidos <span style={{ fontSize:12, color:'#6B9080', fontWeight:400 }}>(opcional)</span>
            </div>
            <div style={{ padding:'14px 20px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 80px', gap:8, marginBottom:10 }}>
                <input value={productoForm.nombre} onChange={e => setProductoForm({ ...productoForm, nombre: e.target.value })}
                  placeholder="Nombre del producto"
                  style={{ padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none' }}/>
                <input type="number" value={productoForm.precio} onChange={e => setProductoForm({ ...productoForm, precio: e.target.value })}
                  placeholder="Precio"
                  style={{ padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none' }}/>
                <button onClick={añadirProducto}
                  style={{ background:'#0A9E6E', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  + Añadir
                </button>
              </div>
              {productosVendidos.map((p, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#F4FAF7', borderRadius:8, marginBottom:6 }}>
                  <span style={{ fontSize:13, color:'#0B1E16' }}>{p.nombre}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:13, fontFamily:'DM Mono, monospace', fontWeight:600 }}>{parseFloat(p.precio).toFixed(2)} EUR</span>
                    <button onClick={() => setProductosVendidos(productosVendidos.filter((_, j) => j !== i))}
                      style={{ background:'transparent', border:'none', color:'#EF4444', cursor:'pointer', fontSize:14 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Descuento y nota */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:6 }}>Descuento (EUR)</div>
              <input type="number" value={descuento} onChange={e => setDescuento(Math.max(0, parseFloat(e.target.value) || 0))}
                min="0" max={subtotal}
                placeholder="0"
                style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none' }}/>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:6 }}>Nota interna</div>
              <textarea value={notaTPV} onChange={e => setNotaTPV(e.target.value)}
                placeholder="Ej: Se aplicó tratamiento extra. Cliente muy satisfecho..."
                style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', minHeight:70, resize:'vertical' }}/>
            </div>
          </div>

        </div>

        {/* RIGHT — Cobro */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Total */}
          <div style={{ background:'#063D2A', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'24px 20px', textAlign:'center' }}>
              <div style={{ fontSize:11, color:'#ffffff60', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>Total a cobrar</div>
              <div style={{ fontSize:48, fontWeight:700, color:'#fff', fontFamily:'DM Mono, monospace', letterSpacing:-2, lineHeight:1 }}>
                {total.toFixed(2)}
              </div>
              <div style={{ fontSize:14, color:'#ffffff60', marginTop:4 }}>EUR · IVA incluido</div>
            </div>
            <div style={{ background:'#052E1F', padding:'14px 20px', display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { label:'Servicio',    val: precioServicio.toFixed(2) + ' EUR' },
                { label:'Productos',   val: totalProductos.toFixed(2) + ' EUR' },
                { label:'Descuento',   val: '-' + descuentoImporte.toFixed(2) + ' EUR', color: descuentoImporte > 0 ? '#EF4444' : '#ffffff40' },
                { label:'Propina',     val: propina.toFixed(2) + ' EUR', color: propina > 0 ? '#0A9E6E' : '#ffffff40' },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', fontSize:12.5 }}>
                  <span style={{ color:'#ffffff60' }}>{item.label}</span>
                  <span style={{ color: item.color || '#fff', fontFamily:'DM Mono, monospace', fontWeight:600 }}>{item.val}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, paddingTop:8, borderTop:'1px solid #ffffff15', marginTop:2 }}>
                <span style={{ color:'#fff', fontWeight:700 }}>TOTAL</span>
                <span style={{ color:'#0A9E6E', fontFamily:'DM Mono, monospace', fontWeight:700 }}>{total.toFixed(2)} EUR</span>
              </div>
            </div>
          </div>

          {/* Propina */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'16px 20px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:10 }}>Propina (opcional)</div>
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              {PROPINAS_RAPIDAS.map(p => (
                <button key={p} onClick={() => { setPropina(p); setPropinaTxt(p.toString()); }}
                  style={{ flex:1, padding:'8px', border:`1.5px solid ${propina === p ? '#0A9E6E' : '#D6EDE5'}`, borderRadius:8, background: propina === p ? '#E8F7F2' : 'transparent', color: propina === p ? '#0A9E6E' : '#6B9080', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  +{p} €
                </button>
              ))}
              <button onClick={() => { setPropina(0); setPropinaTxt(''); }}
                style={{ flex:1, padding:'8px', border:'1.5px solid #D6EDE5', borderRadius:8, background: propina === 0 ? '#F1F5F9' : 'transparent', color:'#6B9080', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Sin propina
              </button>
            </div>
            <input type="number" value={propinaTxt} min="0"
              onChange={e => { const v = Math.max(0, parseFloat(e.target.value) || 0); setPropina(v); setPropinaTxt(e.target.value); }}
              placeholder="Cantidad personalizada"
              style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none' }}/>
          </div>

          {/* Método de pago */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'16px 20px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:10 }}>Método de pago</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {METODOS.map(m => (
                <label key={m.id} onClick={() => setMetodo(m.id)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', border:`1.5px solid ${metodo === m.id ? '#0A9E6E' : '#D6EDE5'}`, borderRadius:10, background: metodo === m.id ? '#E8F7F2' : '#F4FAF7', cursor:'pointer', transition:'all 0.15s' }}>
                  <span style={{ fontSize:20 }}>{m.emoji}</span>
                  <span style={{ fontSize:14, fontWeight:600, color:'#0B1E16' }}>{m.label}</span>
                  {metodo === m.id && <span style={{ marginLeft:'auto', color:'#0A9E6E', fontSize:16 }}>✓</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Factura */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>Enviar factura al cliente</div>
              <div style={{ fontSize:11.5, color:'#6B9080', marginTop:2 }}>
                PDF por email a {reserva.clientes?.email || '—'}
              </div>
            </div>
            <div onClick={() => setEnviarFactura(!enviarFactura)} style={{
              width:40, height:22, borderRadius:11,
              background: enviarFactura ? '#0A9E6E' : '#D6EDE5',
              position:'relative', cursor:'pointer', transition:'background 0.2s', flexShrink:0,
            }}>
              <div style={{ position:'absolute', width:16, height:16, borderRadius:'50%', background:'#fff', top:3, left: enviarFactura ? 21 : 3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
            </div>
          </div>

          {/* Botón cobrar */}
          <button onClick={cobrar} disabled={procesando || cobrado}
            style={{
              width:'100%', padding:'16px',
              background: procesando ? '#A8C4B8' : '#0A9E6E',
              color:'#fff', border:'none', borderRadius:12,
              fontSize:16, fontWeight:700, cursor: procesando ? 'not-allowed' : 'pointer',
              transition:'background 0.15s',
              boxShadow: procesando ? 'none' : '0 4px 14px #0A9E6E40',
            }}>
            {procesando ? 'Procesando...' : `Cobrar ${total.toFixed(2)} EUR`}
          </button>

          <div style={{ fontSize:11.5, color:'#A8C4B8', textAlign:'center' }}>
            Esta acción marcará la reserva como completada y no se puede deshacer
          </div>

        </div>
      </div>
    </div>
  );
}