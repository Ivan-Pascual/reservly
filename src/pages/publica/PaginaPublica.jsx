import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import { notificaciones } from '../../services/notificaciones';
import { pushNotifications } from '../../services/notificacionesPush';

const DIAS_SEMANA = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function PaginaPublica() {
  const { slug } = useParams();
  const [negocio, setNegocio] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cierres, setCierres] = useState([]);
  const [configuracion, setConfiguracion] = useState(null);
  const [reservasExistentes, setReservasExistentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [paso, setPaso] = useState(0);
  const [selServicio, setSelServicio] = useState(null);
  const [selEmpleado, setSelEmpleado] = useState(null);
  const [selFecha, setSelFecha] = useState(null);
  const [selHora, setSelHora] = useState(null);
  const [datosCliente, setDatosCliente] = useState({ nombre:'', email:'', telefono:'' });
  const [enviando, setEnviando] = useState(false);
  const [reservaId, setReservaId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNegocio();
  }, [slug]);

  const fetchNegocio = async () => {
    const { data: neg } = await supabase
      .from('negocios').select('*').eq('slug', slug).single();
    if (!neg) { setNotFound(true); setLoading(false); return; }
    setNegocio(neg);

    const [serRes, empRes, cierresRes, cfgRes] = await Promise.all([
      supabase.from('servicios').select('*').eq('negocio_id', neg.id).eq('activo', true),
      supabase.from('empleados').select('*').eq('negocio_id', neg.id).eq('activo', true),
      supabase.from('cierres').select('*').eq('negocio_id', neg.id),
      supabase.from('configuracion').select('*').eq('negocio_id', neg.id).single(),
    ]);

    if (serRes.data)   setServicios(serRes.data);
    if (empRes.data)   setEmpleados(empRes.data);
    if (cierresRes.data) setCierres(cierresRes.data);
    if (cfgRes.data)   setConfiguracion(cfgRes.data);
    setLoading(false);
  };

  const fetchReservasDelDia = async (fecha, empleadoId) => {
    const query = supabase
      .from('reservas').select('hora_inicio, hora_fin')
      .eq('negocio_id', negocio.id).eq('fecha', fecha)
      .in('estado', ['confirmada', 'pendiente']);
    if (empleadoId) query.eq('empleado_id', empleadoId);
    const { data } = await query;
    setReservasExistentes(data || []);
  };

  const generarHuecos = () => {
    if (!selServicio || !selFecha) return [];
    const duracion = selServicio.duracion || 45;
    const huecos = [];

    const diasMap = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
    const nombreDia = diasMap[selFecha.getDay()];

    let inicioMin = 9 * 60;
    let finMin    = 19 * 60;

    if (configuracion) {
      const activo   = configuracion[`horario_${nombreDia}_activo`];
      if (activo === false) return [];
      const apertura = configuracion[`horario_${nombreDia}_apertura`]?.slice(0,5) || '09:00';
      const cierre   = configuracion[`horario_${nombreDia}_cierre`]?.slice(0,5)   || '19:00';
      const [hIni, mIni] = apertura.split(':').map(Number);
      const [hFin, mFin] = cierre.split(':').map(Number);
      inicioMin = hIni * 60 + mIni;
      finMin    = hFin * 60 + mFin;
    }

    for (let min = inicioMin; min + duracion <= finMin; min += 30) {
      const horaStr    = `${String(Math.floor(min/60)).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`;
      const horaFinStr = `${String(Math.floor((min+duracion)/60)).padStart(2,'0')}:${String((min+duracion)%60).padStart(2,'0')}`;
      const ocupado = reservasExistentes.some(r => {
        const rIni = r.hora_inicio?.slice(0,5);
        const rFin = r.hora_fin?.slice(0,5);
        return horaStr < rFin && horaFinStr > rIni;
      });
      if (!ocupado) huecos.push({ hora: horaStr, horaFin: horaFinStr });
    }
    return huecos;
  };

  const isDiaCerrado = (fecha) => {
    const diasMap = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
    const nombreDia = diasMap[fecha.getDay()];
    if (configuracion && configuracion[`horario_${nombreDia}_activo`] === false) return true;
    const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}-${String(fecha.getDate()).padStart(2,'0')}`;
    return cierres.some(c => fechaStr >= c.fecha_inicio && fechaStr <= c.fecha_fin);
  };

  const generarDias = () => {
    const dias = [];
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    for (let i = 1; i <= 30; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      if (!isDiaCerrado(d)) dias.push(d);
    }
    return dias;
  };

  const confirmarReserva = async () => {
    if (!datosCliente.nombre.trim() || !datosCliente.telefono.trim()) {
      setError('Nombre y teléfono son obligatorios.');
      return;
    }
    const telLimpio = datosCliente.telefono.replace(/\s/g, '');
    if (telLimpio.length < 9) {
      setError('Introduce un teléfono válido.');
      return;
    }
    if (datosCliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.email)) {
      setError('El email no tiene un formato válido.');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      // Anti-spam
      const hace24h = new Date(Date.now() - 24*60*60*1000).toISOString();
      const { data: clienteSpam } = await supabase
        .from('clientes').select('id')
        .eq('negocio_id', negocio.id).eq('telefono', telLimpio).single();

      if (clienteSpam) {
        const { count: reservasCliente } = await supabase
          .from('reservas').select('*', { count:'exact', head:true })
          .eq('negocio_id', negocio.id).eq('cliente_id', clienteSpam.id)
          .gte('created_at', hace24h).in('estado', ['pendiente','confirmada']);
        if (reservasCliente >= 3) {
          setError('Has alcanzado el límite de reservas por hoy. Llama directamente al negocio.');
          setEnviando(false);
          return;
        }
      }

      // Doble check disponibilidad
      const fechaStr = `${selFecha.getFullYear()}-${String(selFecha.getMonth()+1).padStart(2,'0')}-${String(selFecha.getDate()).padStart(2,'0')}`;
      const { data: conflicto } = await supabase
        .from('reservas').select('id')
        .eq('negocio_id', negocio.id).eq('fecha', fechaStr)
        .eq('empleado_id', selEmpleado?.id || empleados[0]?.id)
        .in('estado', ['confirmada','pendiente'])
        .lt('hora_inicio', selHora.horaFin)
        .gt('hora_fin', selHora.hora);

      if (conflicto && conflicto.length > 0) {
        setError('Lo sentimos, este hueco ya ha sido reservado. Por favor elige otro horario.');
        setEnviando(false);
        return;
      }

      // Buscar o crear cliente
      let clienteId = null;
      const { data: clienteExistente } = await supabase
        .from('clientes').select('id')
        .eq('negocio_id', negocio.id).eq('telefono', telLimpio).single();

      if (clienteExistente) {
        clienteId = clienteExistente.id;
      } else {
        const { data: nuevoCliente } = await supabase
          .from('clientes').insert({
            negocio_id: negocio.id,
            nombre:     datosCliente.nombre,
            email:      datosCliente.email || null,
            telefono:   telLimpio,
            tag:        'nuevo',
          }).select().single();
        if (nuevoCliente) clienteId = nuevoCliente.id;
      }

      // Crear reserva
      const { data: reserva, error: resError } = await supabase
        .from('reservas').insert({
          negocio_id:   negocio.id,
          cliente_id:   clienteId,
          empleado_id:  selEmpleado?.id || null,
          servicio_id:  selServicio.id,
          fecha:        fechaStr,
          hora_inicio:  selHora.hora,
          hora_fin:     selHora.horaFin,
          estado:       'pendiente',
          precio_final: selServicio.precio,
        }).select().single();

      if (resError) throw new Error('Error al crear la reserva.');

      // Enviar confirmación por email si tiene email
      if (datosCliente.email) {
        const { data: servicioData } = await supabase
          .from('servicios').select('nombre').eq('id', selServicio.id).single();
        notificaciones.confirmarReserva({
          cliente:  { nombre: datosCliente.nombre, email: datosCliente.email },
          negocio,
          reserva:  { fecha: fechaStr, hora_inicio: selHora.hora },
          servicio: servicioData,
          empleado: selEmpleado,
        });
      }
// Notificar al negocio de la nueva reserva
pushNotifications.nuevaReserva({
  clienteNombre: datosCliente.nombre,
  servicio:      selServicio?.nombre || 'Servicio',
  fecha:         fechaStr,
  hora:          selHora.hora,
});
      setReservaId(reserva.id);
      setPaso(6);
    } catch (err) {
      setError(err.message || 'Error al confirmar la reserva. Inténtalo de nuevo.');
    }
    setEnviando(false);
  };

  const dias = generarDias();
  const huecos = generarHuecos();

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F4FAF7' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F4FAF7', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:48 }}>🔍</div>
      <div style={{ fontSize:20, fontWeight:700, color:'#0B1E16' }}>Negocio no encontrado</div>
      <div style={{ fontSize:14, color:'#6B9080' }}>La URL reservly.com/{slug} no existe</div>
    </div>
  );

  const inputStyle = {
    width:'100%', padding:'12px 14px',
    border:'1.5px solid #D6EDE5', borderRadius:10,
    fontSize:14, fontFamily:'DM Sans, sans-serif',
    outline:'none', background:'#fff',
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F4FAF7', fontFamily:'DM Sans, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background:'#063D2A', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
              stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="white"/>
            <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
          </svg>
          <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Reservly</span>
        </div>
        <div style={{ fontSize:12, color:'#ffffff60' }}>reservly.com/{slug}</div>
      </div>

      {/* Info negocio */}
      <div style={{ background:'#0A9E6E', padding:'32px 24px', textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:700, color:'#fff', margin:'0 auto 14px', border:'3px solid rgba(255,255,255,0.3)' }}>
          {negocio.nombre?.[0]?.toUpperCase()}
        </div>
        <h1 style={{ fontSize:24, fontWeight:700, color:'#fff', marginBottom:6 }}>{negocio.nombre}</h1>
        {negocio.descripcion && (
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.8)', maxWidth:400, margin:'0 auto 10px', lineHeight:1.5 }}>{negocio.descripcion}</p>
        )}
        {negocio.direccion && (
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>📍 {negocio.direccion}</div>
        )}
        {negocio.telefono && (
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginTop:4 }}>📞 {negocio.telefono}</div>
        )}
      </div>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'32px 20px' }}>

        {/* PASO 6: CONFIRMADO */}
        {paso === 6 && (
          <div style={{ background:'#fff', borderRadius:16, padding:'40px 32px', textAlign:'center' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'#E8F7F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 20px' }}>✓</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#0B1E16', marginBottom:10 }}>¡Reserva confirmada!</h2>
            <p style={{ fontSize:14, color:'#6B9080', lineHeight:1.6, marginBottom:24 }}>
              Hemos recibido tu reserva en <strong>{negocio.nombre}</strong>.<br/>
              Recibirás una confirmación pronto.
            </p>
            <div style={{ background:'#F4FAF7', borderRadius:12, padding:20, marginBottom:24, textAlign:'left' }}>
              {[
                { label:'Servicio',    val: selServicio?.nombre },
                { label:'Profesional', val: selEmpleado?.nombre },
                { label:'Fecha',       val: selFecha ? `${DIAS_SEMANA[selFecha.getDay()]} ${selFecha.getDate()} ${MESES[selFecha.getMonth()]}` : '' },
                { label:'Hora',        val: selHora?.hora },
              ].filter(r => r.val).map((r, i, arr) => (
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom: i<arr.length-1?'1px solid #EAF5EF':'none', fontSize:13 }}>
                  <span style={{ color:'#6B9080' }}>{r.label}</span>
                  <span style={{ fontWeight:600 }}>{r.val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => {
              setPaso(0); setSelServicio(null); setSelEmpleado(null);
              setSelFecha(null); setSelHora(null);
              setDatosCliente({ nombre:'', email:'', telefono:'' }); setError('');
            }} style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'12px 28px', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>
              Hacer otra reserva
            </button>
          </div>
        )}

        {/* PASO 0: SERVICIO */}
        {paso === 0 && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Reserva tu cita</h2>
            <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>Elige el servicio que necesitas</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {servicios.map(s => (
                <div key={s.id} onClick={() => { setSelServicio(s); setPaso(negocio.tipo === 'profesional' ? 1 : 2); }}
                  style={{ background:'#fff', border:'1.5px solid #EAF5EF', borderRadius:12, padding:'16px 18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#0A9E6E'; e.currentTarget.style.background='#E8F7F2'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#EAF5EF'; e.currentTarget.style.background='#fff'; }}
                >
                  <div>
                    <div style={{ fontSize:15, fontWeight:600, color:'#0B1E16' }}>{s.nombre}</div>
                    <div style={{ fontSize:12.5, color:'#6B9080', marginTop:3 }}>{s.duracion} min</div>
                  </div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>
                    {s.precio_a_consultar ? 'A consultar' : s.precio ? `${s.precio} EUR` : '—'}
                  </div>
                </div>
              ))}
              {servicios.length === 0 && (
                <div style={{ padding:40, textAlign:'center', color:'#A8C4B8', fontSize:14 }}>
                  Este negocio aún no tiene servicios publicados
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 1: EMPLEADO */}
        {paso === 1 && (
          <div>
            <button onClick={() => setPaso(0)} style={{ background:'transparent', border:'none', color:'#6B9080', fontSize:13, cursor:'pointer', marginBottom:16, display:'flex', alignItems:'center', gap:4 }}>← Volver</button>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>¿Con quién quieres la cita?</h2>
            <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>Selecciona un profesional o deja que te asignemos uno</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div onClick={() => { setSelEmpleado(null); setPaso(2); }}
                style={{ background:'#fff', border:'1.5px solid #EAF5EF', borderRadius:12, padding:'14px 18px', cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#0A9E6E'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#EAF5EF'}
              >
                <div style={{ width:44, height:44, borderRadius:'50%', background:'#EAF5EF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🎲</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#0B1E16' }}>Sin preferencia</div>
                  <div style={{ fontSize:12, color:'#6B9080' }}>Te asignamos el profesional disponible</div>
                </div>
              </div>
              {empleados.map(e => (
                <div key={e.id} onClick={() => { setSelEmpleado(e); setPaso(2); }}
                  style={{ background:'#fff', border:'1.5px solid #EAF5EF', borderRadius:12, padding:'14px 18px', cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}
                  onMouseEnter={ev => ev.currentTarget.style.borderColor='#0A9E6E'}
                  onMouseLeave={ev => ev.currentTarget.style.borderColor='#EAF5EF'}
                >
                  <div style={{ width:44, height:44, borderRadius:'50%', background:e.color||'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' }}>
                    {e.nombre[0].toUpperCase()}
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#0B1E16' }}>{e.nombre}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: FECHA */}
        {paso === 2 && (
          <div>
            <button onClick={() => setPaso(negocio.tipo === 'profesional' ? 1 : 0)} style={{ background:'transparent', border:'none', color:'#6B9080', fontSize:13, cursor:'pointer', marginBottom:16, display:'flex', alignItems:'center', gap:4 }}>← Volver</button>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>¿Qué día te viene bien?</h2>
            <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>Próximos 30 días disponibles</p>
            {dias.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {dias.map((d, i) => (
                  <div key={i} onClick={() => {
                    setSelFecha(d);
                    fetchReservasDelDia(
                      `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
                      selEmpleado?.id || (empleados[0]?.id || null)
                    );
                    setPaso(3);
                  }}
                    style={{ background:'#fff', border:`1.5px solid ${selFecha?.toDateString()===d.toDateString() ? '#0A9E6E' : '#EAF5EF'}`, borderRadius:10, padding:'12px 8px', cursor:'pointer', textAlign:'center' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='#0A9E6E'}
                    onMouseLeave={e => e.currentTarget.style.borderColor=selFecha?.toDateString()===d.toDateString()?'#0A9E6E':'#EAF5EF'}
                  >
                    <div style={{ fontSize:10.5, color:'#6B9080', fontWeight:600, textTransform:'uppercase' }}>{DIAS_SEMANA[d.getDay()].slice(0,3)}</div>
                    <div style={{ fontSize:20, fontWeight:700, color:'#0B1E16', margin:'4px 0' }}>{d.getDate()}</div>
                    <div style={{ fontSize:10.5, color:'#6B9080' }}>{MESES[d.getMonth()]}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:12, padding:24, textAlign:'center' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>😔</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#92400E' }}>No hay días disponibles</div>
                <div style={{ fontSize:13, color:'#6B9080', marginTop:4 }}>Contacta directamente con el negocio</div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3: HORA */}
        {paso === 3 && (
          <div>
            <button onClick={() => setPaso(2)} style={{ background:'transparent', border:'none', color:'#6B9080', fontSize:13, cursor:'pointer', marginBottom:16, display:'flex', alignItems:'center', gap:4 }}>← Volver</button>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>¿A qué hora?</h2>
            <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>
              {selFecha ? `${DIAS_SEMANA[selFecha.getDay()]} ${selFecha.getDate()} de ${MESES[selFecha.getMonth()]}` : ''}
              {selServicio ? ` · ${selServicio.duracion} min` : ''}
            </p>
            {huecos.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {huecos.map((h, i) => (
                  <div key={i} onClick={() => { setSelHora(h); setPaso(4); }}
                    style={{ background:'#fff', border:`1.5px solid ${selHora?.hora===h.hora ? '#0A9E6E' : '#EAF5EF'}`, borderRadius:10, padding:'12px 8px', cursor:'pointer', textAlign:'center' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='#0A9E6E'}
                    onMouseLeave={e => e.currentTarget.style.borderColor=selHora?.hora===h.hora?'#0A9E6E':'#EAF5EF'}
                  >
                    <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{h.hora}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:12, padding:'24px', textAlign:'center' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>😔</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#92400E', marginBottom:4 }}>No hay huecos disponibles</div>
                <div style={{ fontSize:13, color:'#6B9080' }}>Prueba con otro día</div>
                <button onClick={() => setPaso(2)} style={{ marginTop:14, background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Elegir otro día
                </button>
              </div>
            )}
          </div>
        )}

        {/* PASO 4: DATOS CLIENTE */}
        {paso === 4 && (
          <div>
            <button onClick={() => setPaso(3)} style={{ background:'transparent', border:'none', color:'#6B9080', fontSize:13, cursor:'pointer', marginBottom:16, display:'flex', alignItems:'center', gap:4 }}>← Volver</button>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Tus datos</h2>
            <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>Para confirmar tu reserva necesitamos tus datos</p>

            <div style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:12, padding:'14px 16px', marginBottom:24 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#063D2A', marginBottom:6 }}>Resumen de tu cita</div>
              <div style={{ fontSize:13, color:'#0B1E16' }}>
                {selServicio?.nombre} · {selFecha ? `${selFecha.getDate()} ${MESES[selFecha.getMonth()]}` : ''} · {selHora?.hora}
                {selEmpleado ? ` · ${selEmpleado.nombre}` : ''}
              </div>
              {selServicio?.precio && !selServicio?.precio_a_consultar && (
                <div style={{ fontSize:14, fontWeight:700, color:'#0A9E6E', marginTop:4, fontFamily:'DM Mono, monospace' }}>{selServicio.precio} EUR</div>
              )}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { key:'nombre',   label:'Nombre completo *', placeholder:'Ej: Carmen López',   type:'text', mono:false },
                { key:'telefono', label:'Teléfono *',         placeholder:'+34 600 000 000',     type:'tel',  mono:true  },
                { key:'email',    label:'Email (opcional)',    placeholder:'tu@email.com',        type:'email',mono:false },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:5 }}>{f.label}</label>
                  <input value={datosCliente[f.key]} onChange={e => setDatosCliente({ ...datosCliente, [f.key]: e.target.value })}
                    placeholder={f.placeholder} type={f.type}
                    style={{ ...inputStyle, fontFamily: f.mono ? 'DM Mono, monospace' : 'DM Sans, sans-serif' }}
                    onFocus={e => e.target.style.borderColor='#0A9E6E'}
                    onBlur={e => e.target.style.borderColor='#D6EDE5'}/>
                </div>
              ))}

              {error && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#EF4444' }}>{error}</div>
              )}

              <button onClick={confirmarReserva} disabled={enviando}
                style={{ width:'100%', padding:'14px', background: enviando ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor: enviando ? 'not-allowed' : 'pointer', marginTop:4 }}>
                {enviando ? 'Confirmando...' : 'Confirmar reserva'}
              </button>

              <div style={{ fontSize:12, color:'#A8C4B8', textAlign:'center', lineHeight:1.6 }}>
                Al confirmar aceptas que {negocio.nombre} guarde tus datos de contacto
                para gestionar tu reserva, de acuerdo con el RGPD.
                Puedes solicitar su eliminación contactando directamente con el negocio.
              </div>
            </div>
          </div>
        )}

        {paso < 6 && (
          <div style={{ textAlign:'center', marginTop:32, fontSize:12, color:'#A8C4B8' }}>
            Reservas gestionadas por <strong style={{ color:'#0A9E6E' }}>Reservly</strong>
          </div>
        )}

      </div>
    </div>
  );
}