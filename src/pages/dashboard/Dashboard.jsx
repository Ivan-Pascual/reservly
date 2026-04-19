import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { pushNotifications } from '../../services/notificacionesPush';

const AptRow = ({ nombre, servicio, empleado, hora_inicio, hora_fin, estado, reservaId, onCobrar }) => {
  const colors = {
    confirmada: { bg:'#E8F7F2', border:'#D6EDE5', dot:'#0A9E6E', badge:'#E8F7F2', badgeText:'#063D2A', label:'Confirmada' },
    pendiente:  { bg:'#FFF8E7', border:'#F5E4A0', dot:'#F59E0B', badge:'#FFF8E7', badgeText:'#92400E', label:'Pendiente'  },
    completada: { bg:'#F1F5F9', border:'#E2E8F0', dot:'#A8C4B8', badge:'#F1F5F9', badgeText:'#6B9080', label:'Completada' },
    cancelada:  { bg:'#FEF2F2', border:'#FECACA', dot:'#EF4444', badge:'#FEF2F2', badgeText:'#EF4444', label:'Cancelada'  },
  };
  const s = colors[estado] || colors.confirmada;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:s.bg, border:`1px solid ${s.border}`, borderRadius:8, marginBottom:6 }}>
      <div style={{ width:3, height:32, borderRadius:2, background:s.dot, flexShrink:0 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{nombre}</div>
        <div style={{ fontSize:11.5, color:'#6B9080', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{servicio} · {empleado}</div>
      </div>
      <div style={{ fontSize:11, fontFamily:'DM Mono, monospace', color:'#6B9080', flexShrink:0 }}>{hora_inicio}–{hora_fin}</div>
      {estado === 'confirmada' ? (
        <button onClick={() => onCobrar(reservaId)}
          style={{ padding:'4px 10px', background:'#063D2A', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
          Cobrar
        </button>
      ) : (
        <div style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:s.badge, color:s.badgeText, flexShrink:0 }}>{s.label}</div>
      )}
    </div>
  );
};

const getMinutosDesdeAhora = (horaStr) => {
  if (!horaStr) return null;
  const ahora = new Date();
  const [h, m] = horaStr.slice(0,5).split(':').map(Number);
  const citaMin = h * 60 + m;
  const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
  return citaMin - ahoraMin;
};

export default function Dashboard() {
  const { negocio, loading } = useNegocio();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [reservasHoy, setReservasHoy] = useState([]);
  const [stats, setStats] = useState({
    hoy:0, mes:0, pendientes:0, canceladas:0,
    facturacionHoy:0, facturacionMes:0, facturacionTotal:0,
    clientesTotal:0, clientesMes:0,
  });
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [permisoNotif, setPermisoNotif] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [horaActual, setHoraActual] = useState(new Date());
  const [notas, setNotas] = useState([]);
  const [notaInput, setNotaInput] = useState('');
  const [pagoExitoso, setPagoExitoso] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pago') === 'ok') {
      setPagoExitoso(true);
      setTimeout(() => setPagoExitoso(false), 6000);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!negocio) return;
    fetchData();
  }, [negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    const hoy = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [
      reservasRes, tpvHoyRes, tpvMesRes, tpvTotalRes,
      totalHoyRes, totalMesRes, canceladasRes, pendientesRes,
      clientesTotalRes, clientesMesRes, empsRes, notasRes,
    ] = await Promise.all([
      supabase.from('reservas').select('*, clientes(nombre), empleados(nombre, color), servicios(nombre)')
        .eq('negocio_id', negocio.id).eq('fecha', hoy).order('hora_inicio'),
      supabase.from('tpv').select('importe').eq('negocio_id', negocio.id)
        .gte('created_at', hoy + 'T00:00:00'),
      supabase.from('tpv').select('importe').eq('negocio_id', negocio.id)
        .gte('created_at', inicioMes + 'T00:00:00'),
      supabase.from('tpv').select('importe').eq('negocio_id', negocio.id),
      // Excluye canceladas
      supabase.from('reservas').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id).eq('fecha', hoy)
        .not('estado', 'eq', 'cancelada'),
      // Excluye canceladas
      supabase.from('reservas').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id).gte('fecha', inicioMes)
        .not('estado', 'eq', 'cancelada'),
      supabase.from('reservas').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id).eq('estado', 'cancelada').eq('fecha', hoy),
      supabase.from('reservas').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id).eq('estado', 'pendiente'),
      supabase.from('clientes').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id),
      supabase.from('clientes').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id).gte('created_at', inicioMes + 'T00:00:00'),
      supabase.from('empleados').select('*').eq('negocio_id', negocio.id).eq('activo', true),
      supabase.from('notas').select('*').eq('negocio_id', negocio.id)
        .order('created_at', { ascending:false }).limit(20),
    ]);

    if (reservasRes.data) setReservasHoy(reservasRes.data);
    if (empsRes.data) setEmpleados(empsRes.data);
    if (notasRes.data) setNotas(notasRes.data);

    const sumarImportes = (data) => (data || []).reduce((a, t) => a + (t.importe||0), 0);

    setStats({
      hoy:              totalHoyRes.count    || 0,
      mes:              totalMesRes.count    || 0,
      pendientes:       pendientesRes.count  || 0,
      canceladas:       canceladasRes.count  || 0,
      facturacionHoy:   sumarImportes(tpvHoyRes.data),
      facturacionMes:   sumarImportes(tpvMesRes.data),
      facturacionTotal: sumarImportes(tpvTotalRes.data),
      clientesTotal:    clientesTotalRes.count || 0,
      clientesMes:      clientesMesRes.count  || 0,
    });

    setCargando(false);
  };

  const agregarNota = async () => {
    if (!notaInput.trim()) return;
    const { data } = await supabase.from('notas').insert({
      negocio_id: negocio.id,
      contenido:  notaInput.trim(),
    }).select().single();
    if (data) setNotas(prev => [data, ...prev]);
    setNotaInput('');
  };

  const eliminarNota = async (id) => {
    await supabase.from('notas').delete().eq('id', id);
    setNotas(prev => prev.filter(n => n.id !== id));
  };

  if (loading || cargando) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  const hoyStrRaw = new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const hoyStr = hoyStrRaw.charAt(0).toUpperCase() + hoyStrRaw.slice(1);
  const nombreNegocio = negocio?.nombre || 'tu negocio';
  const slug = negocio?.slug || '';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';
  const pad = isMobile ? 16 : 32;

  const proximasCitas = reservasHoy.filter(r => {
    if (r.estado === 'cancelada' || r.estado === 'completada') return false;
    const minutos = getMinutosDesdeAhora(r.hora_inicio);
    return minutos !== null && minutos >= 0 && minutos <= 120;
  });

  const citaEnCurso = reservasHoy.filter(r => {
    if (r.estado === 'cancelada') return false;
    const miniInicio = getMinutosDesdeAhora(r.hora_inicio);
    const miniFin    = getMinutosDesdeAhora(r.hora_fin);
    return miniInicio !== null && miniFin !== null && miniInicio <= 0 && miniFin > 0;
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Inicio</div>
        {!isMobile && (
          <div style={{ background:'#EAF5EF', padding:'3px 10px', borderRadius:20, fontSize:12, color:'#6B9080', fontFamily:'DM Mono, monospace' }}>
            {hoyStr}
          </div>
        )}
        <div style={{ marginLeft:'auto', display:'flex', gap:8, flexWrap:'wrap' }}>
          {!isMobile && (
            <button onClick={() => navigate('/agenda')}
              style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              📅 Ver agenda
            </button>
          )}
          {permisoNotif !== 'granted' && (
            <button onClick={async () => {
              const ok = await pushNotifications.solicitarPermiso();
              setPermisoNotif(ok ? 'granted' : 'denied');
            }}
              style={{ background:'#FFF8E7', color:'#92400E', border:'1px solid #F5E4A0', padding:'7px 14px', borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
              🔔 Activar alertas
            </button>
          )}
          {permisoNotif === 'granted' && !isMobile && (
            <span style={{ fontSize:12, color:'#0A9E6E', display:'flex', alignItems:'center', gap:4 }}>
              🔔 Alertas activas
            </span>
          )}
          <button onClick={() => navigate('/reservas')}
            style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + Nueva
          </button>
        </div>
      </div>

      {/* Banner trial */}
      {negocio?.plan === 'trial' && (() => {
        const expiry = negocio?.plan_expiry ? new Date(negocio.plan_expiry) : null;
        const dias = expiry ? Math.max(0, Math.ceil((expiry - new Date()) / (1000*60*60*24))) : 30;
        if (dias > 7) return null;
        return (
          <div style={{ background: dias <= 3 ? '#FEF2F2' : '#FFF8E7', borderBottom:`1px solid ${dias <= 3 ? '#FECACA' : '#F5E4A0'}`, padding:'10px 24px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:16 }}>{dias <= 3 ? '⚠️' : '⏰'}</span>
            <div style={{ flex:1 }}>
              <span style={{ fontSize:13, fontWeight:600, color: dias <= 3 ? '#991B1B' : '#92400E' }}>
                {dias === 0 ? 'Tu periodo de prueba ha expirado.' : `Tu periodo de prueba termina en ${dias} ${dias === 1 ? 'día' : 'días'}.`}
              </span>
              <span style={{ fontSize:13, color: dias <= 3 ? '#B91C1C' : '#92400E', marginLeft:6 }}>
                Elige un plan para no perder el acceso.
              </span>
            </div>
            <button onClick={() => navigate('/ajustes')}
              style={{ background: dias <= 3 ? '#EF4444' : '#F59E0B', color:'#fff', border:'none', padding:'6px 16px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
              Ver planes →
            </button>
          </div>
        );
      })()}

      {/* Banner pago exitoso */}
      {pagoExitoso && (
        <div style={{ background:'#063D2A', padding:'14px 24px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:'#0A9E6E', flexShrink:0, boxShadow:'0 0 0 3px rgba(10,158,110,0.3)' }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>¡Plan activado correctamente!</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>Recibirás la confirmación por email. Ya tienes acceso a todas las funciones.</div>
          </div>
          <button onClick={() => setPagoExitoso(false)}
            style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', fontSize:18, cursor:'pointer', padding:'0 4px' }}>✕</button>
        </div>
      )}

      <div style={{ padding:pad, display:'flex', flexDirection:'column', gap:16 }}>

        {/* Cita en curso */}
        {citaEnCurso.length > 0 && (
          <div style={{ background:'#063D2A', borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#0A9E6E', flexShrink:0, boxShadow:'0 0 0 3px rgba(10,158,110,0.3)' }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>En curso ahora</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>
                {citaEnCurso[0].clientes?.nombre} — {citaEnCurso[0].servicios?.nombre}
              </div>
            </div>
            <button onClick={() => navigate(`/tpv/${citaEnCurso[0].id}`)}
              style={{ padding:'6px 14px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
              Cobrar →
            </button>
            <div style={{ fontSize:13, color:'#0A9E6E', fontFamily:'DM Mono, monospace', fontWeight:600 }}>
              {citaEnCurso[0].hora_inicio?.slice(0,5)}–{citaEnCurso[0].hora_fin?.slice(0,5)}
            </div>
          </div>
        )}

        {/* Próximas 2h */}
        {proximasCitas.length > 0 && (
          <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:12, padding:'14px 18px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#92400E', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
              ⏰ Próximas 2 horas — {proximasCitas.length} {proximasCitas.length === 1 ? 'cita' : 'citas'}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {proximasCitas.map(r => {
                const minutos = getMinutosDesdeAhora(r.hora_inicio);
                return (
                  <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.7)', borderRadius:8, padding:'8px 12px' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#F59E0B', fontFamily:'DM Mono, monospace', minWidth:36 }}>
                      {minutos < 60 ? `${minutos}m` : `${Math.floor(minutos/60)}h${minutos%60>0?minutos%60+'m':''}`}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.clientes?.nombre || 'Cliente'}</div>
                      <div style={{ fontSize:11.5, color:'#6B9080' }}>{r.servicios?.nombre} · {r.hora_inicio?.slice(0,5)}</div>
                    </div>
                    {r.empleados && (
                      <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:r.empleados.color||'#ccc' }}/>
                        <span style={{ fontSize:11, color:'#6B9080' }}>{r.empleados.nombre}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Saludo */}
        <div style={{ display:'flex', alignItems: isMobile ? 'flex-start' : 'flex-end', justifyContent:'space-between', flexDirection: isMobile ? 'column' : 'row', gap:10 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight:700, color:'#0B1E16', letterSpacing:-0.5, margin:0 }}>
              {saludo}, {nombreNegocio} 👋
            </h1>
            <p style={{ fontSize:13.5, color:'#6B9080', marginTop:4, marginBottom:0 }}>
              {stats.hoy > 0
                ? `Tienes ${stats.hoy} citas hoy y ${stats.pendientes} pendientes.`
                : 'No tienes citas hoy.'}
            </p>
          </div>
          {slug && (
            <div onClick={() => window.open(`/reservar/${slug}`, '_blank')}
              style={{ display:'flex', alignItems:'center', gap:6, background:'#E8F7F2', border:'1px solid #D6EDE5', color:'#063D2A', fontSize:12, fontWeight:600, padding:'6px 12px', borderRadius:20, cursor:'pointer', whiteSpace:'nowrap' }}>
              <span style={{ width:7, height:7, background:'#0A9E6E', borderRadius:'50%', display:'inline-block' }}/>
              {isMobile ? 'Ver página pública' : `getreservly.com/reservar/${slug}`}
            </div>
          )}
        </div>

        {/* Stats reservas */}
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Reservas</div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
            {[
              { label:'Citas hoy',  value: stats.hoy,        featured:true },
              { label:'Este mes',   value: stats.mes,         note:'excl. canceladas' },
              { label:'Pendientes', value: stats.pendientes   },
              { label:'Canceladas', value: stats.canceladas   },
            ].map(s => (
              <div key={s.label} style={{ background: s.featured ? '#063D2A' : '#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
                <div style={{ fontSize:11, fontWeight:600, color: s.featured ? '#ffffff60' : '#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:28, fontWeight:700, color: s.featured ? '#fff' : '#0B1E16', fontFamily:'DM Mono, monospace', lineHeight:1 }}>{s.value}</div>
                {s.note && <div style={{ fontSize:10, color:'#A8C4B8', marginTop:4 }}>{s.note}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Stats facturación */}
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Facturación</div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Hoy</div>
              <div style={{ fontSize:22, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace', lineHeight:1 }}>{stats.facturacionHoy.toFixed(2)}</div>
              <div style={{ fontSize:11, color:'#6B9080', marginTop:4 }}>EUR</div>
            </div>
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Este mes</div>
              <div style={{ fontSize:22, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace', lineHeight:1 }}>{stats.facturacionMes.toFixed(2)}</div>
              <div style={{ fontSize:11, color:'#6B9080', marginTop:4 }}>EUR</div>
            </div>
            <div style={{ background:'#063D2A', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#ffffff60', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Total acumulado</div>
              <div style={{ fontSize:22, fontWeight:700, color:'#fff', fontFamily:'DM Mono, monospace', lineHeight:1 }}>{stats.facturacionTotal.toFixed(2)}</div>
              <div style={{ fontSize:11, color:'#0A9E6E', marginTop:4 }}>EUR</div>
            </div>
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Clientes</div>
              <div style={{ fontSize:28, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace', lineHeight:1 }}>{stats.clientesTotal}</div>
              <div style={{ fontSize:11, color:'#6B9080', marginTop:4 }}>+{stats.clientesMes} este mes</div>
            </div>
          </div>
        </div>

        {/* Middle */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap:16 }}>

          {/* Agenda hoy */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>Agenda de hoy</div>
                <div style={{ fontSize:12, color:'#6B9080', marginTop:1 }}>{stats.hoy} citas</div>
              </div>
              <span onClick={() => navigate('/agenda')} style={{ fontSize:12, fontWeight:600, color:'#0A9E6E', cursor:'pointer' }}>
                Ver semana →
              </span>
            </div>
            <div style={{ padding:'14px 16px' }}>
              {reservasHoy.length > 0 ? (
                reservasHoy.map(r => (
                  <AptRow
                    key={r.id}
                    nombre={r.clientes?.nombre    || 'Cliente'}
                    servicio={r.servicios?.nombre || 'Servicio'}
                    empleado={r.empleados?.nombre || 'Empleado'}
                    hora_inicio={r.hora_inicio?.slice(0,5)}
                    hora_fin={r.hora_fin?.slice(0,5)}
                    estado={r.estado}
                    reservaId={r.id}
                    onCobrar={(id) => navigate(`/tpv/${id}`)}
                  />
                ))
              ) : (
                <div style={{ textAlign:'center', padding:'32px 0', color:'#A8C4B8' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>📅</div>
                  <div style={{ fontSize:14 }}>No hay reservas para hoy</div>
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral desktop */}
          {!isMobile && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>
                  Empleados activos
                </div>
                {empleados.length > 0 ? (
                  empleados.map(e => (
                    <div key={e.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #EAF5EF' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:500, color:'#0B1E16' }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:e.color||'#0A9E6E' }}/>
                        {e.nombre}
                      </div>
                      <div style={{ fontSize:11, color:'#6B9080' }}>activo</div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign:'center', padding:'16px 0', color:'#A8C4B8', fontSize:13 }}>Sin empleados aún</div>
                )}
              </div>

              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>
                  📝 Notas internas
                </div>
                <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                  <input
                    value={notaInput}
                    onChange={e => setNotaInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && agregarNota()}
                    placeholder="Añadir nota..."
                    style={{ flex:1, padding:'7px 10px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:12.5, fontFamily:'DM Sans, sans-serif', outline:'none' }}
                    onFocus={e => e.target.style.borderColor='#0A9E6E'}
                    onBlur={e => e.target.style.borderColor='#D6EDE5'}
                  />
                  <button onClick={agregarNota}
                    style={{ padding:'7px 10px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    +
                  </button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:180, overflowY:'auto' }}>
                  {notas.length > 0 ? notas.map(n => (
                    <div key={n.id}
                      style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'7px 8px', background:'#F4FAF7', borderRadius:8 }}
                      onMouseEnter={e => { const btn = e.currentTarget.querySelector('.del-btn'); if (btn) btn.style.opacity='1'; }}
                      onMouseLeave={e => { const btn = e.currentTarget.querySelector('.del-btn'); if (btn) btn.style.opacity='0'; }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:'#0A9E6E', marginTop:5, flexShrink:0 }}/>
                      <div style={{ flex:1, fontSize:12.5, color:'#0B1E16', lineHeight:1.5 }}>{n.contenido}</div>
                      <button className="del-btn" onClick={() => eliminarNota(n.id)}
                        style={{ background:'transparent', border:'none', color:'#EF4444', fontSize:12, cursor:'pointer', opacity:0, transition:'opacity 0.15s', flexShrink:0, padding:'0 2px' }}>
                        ✕
                      </button>
                    </div>
                  )) : (
                    <div style={{ fontSize:12, color:'#A8C4B8', textAlign:'center', padding:'12px 0' }}>Sin notas aún</div>
                  )}
                </div>
              </div>

              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>
                  Accesos rápidos
                </div>
                {[
                  { label:'Ver todas las reservas', ruta:'/reservas',     emoji:'📅' },
                  { label:'Gestionar clientes',     ruta:'/clientes',     emoji:'👤' },
                  { label:'Ver estadísticas',       ruta:'/estadisticas', emoji:'📈' },
                  { label:'Configurar ajustes',     ruta:'/ajustes',      emoji:'⚙️' },
                ].map(a => (
                  <div key={a.ruta} onClick={() => navigate(a.ruta)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 8px', borderRadius:8, cursor:'pointer', marginBottom:2 }}
                    onMouseEnter={e => e.currentTarget.style.background='#F4FAF7'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <span style={{ fontSize:14 }}>{a.emoji}</span>
                    <span style={{ fontSize:13, color:'#0B1E16', fontWeight:500 }}>{a.label}</span>
                    <span style={{ marginLeft:'auto', fontSize:12, color:'#A8C4B8' }}>→</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accesos rápidos móvil */}
          {isMobile && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Reservas',     ruta:'/reservas',     emoji:'📅' },
                { label:'Clientes',     ruta:'/clientes',     emoji:'👤' },
                { label:'Estadísticas', ruta:'/estadisticas', emoji:'📈' },
                { label:'Agenda',       ruta:'/agenda',       emoji:'🗓️' },
              ].map(a => (
                <div key={a.ruta} onClick={() => navigate(a.ruta)}
                  style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px', cursor:'pointer', textAlign:'center' }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{a.emoji}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{a.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}