import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ value, label, sub, featured, onClick }) => (
  <div onClick={onClick} style={{
    background: featured ? '#063D2A' : '#fff',
    border: '1px solid #EAF5EF',
    borderRadius: 14,
    padding: 20,
    flex: 1,
    cursor: onClick ? 'pointer' : 'default',
  }}>
    <div style={{ fontSize:11, fontWeight:600, color: featured ? '#ffffff60' : '#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>{label}</div>
    <div style={{ fontSize:32, fontWeight:700, color: featured ? '#fff' : '#0B1E16', fontFamily:'DM Mono, monospace', letterSpacing:-1, lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:11.5, color: featured ? '#0A9E6E' : '#6B9080', marginTop:6 }}>{sub}</div>
  </div>
);

const AptRow = ({ nombre, servicio, empleado, hora_inicio, hora_fin, estado }) => {
  const colors = {
    confirmada: { bg:'#E8F7F2', border:'#D6EDE5', dot:'#0A9E6E', badge:'#E8F7F2', badgeText:'#063D2A', label:'Confirmada' },
    pendiente:  { bg:'#FFF8E7', border:'#F5E4A0', dot:'#F59E0B', badge:'#FFF8E7', badgeText:'#92400E', label:'Pendiente'  },
    completada: { bg:'#F1F5F9', border:'#E2E8F0', dot:'#A8C4B8', badge:'#F1F5F9', badgeText:'#6B9080', label:'Completada' },
    cancelada:  { bg:'#FEF2F2', border:'#FECACA', dot:'#EF4444', badge:'#FEF2F2', badgeText:'#EF4444', label:'Cancelada'  },
  };
  const s = colors[estado] || colors.confirmada;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:s.bg, border:`1px solid ${s.border}`, borderRadius:8, marginBottom:6 }}>
      <div style={{ width:3, height:32, borderRadius:2, background:s.dot, flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{nombre}</div>
        <div style={{ fontSize:11.5, color:'#6B9080' }}>{servicio} · {empleado}</div>
      </div>
      <div style={{ fontSize:11, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{hora_inicio}–{hora_fin}</div>
      <div style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:s.badge, color:s.badgeText }}>{s.label}</div>
    </div>
  );
};

export default function Dashboard() {
  const { negocio, loading } = useNegocio();
  const navigate = useNavigate();
  const [reservasHoy, setReservasHoy] = useState([]);
  const [stats, setStats] = useState({
    hoy:0, mes:0, pendientes:0, canceladas:0,
    facturacionHoy:0, facturacionMes:0, facturacionTotal:0,
    clientesTotal:0, clientesMes:0,
  });
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!negocio) return;
    fetchData();
  }, [negocio]);

  const fetchData = async () => {
    const hoy = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [
      reservasRes, tpvHoyRes, tpvMesRes, tpvTotalRes,
      totalHoyRes, totalMesRes, canceladasRes, pendientesRes,
      clientesTotalRes, clientesMesRes, empsRes,
    ] = await Promise.all([
      supabase.from('reservas').select('*, clientes(nombre), empleados(nombre), servicios(nombre)')
        .eq('negocio_id', negocio.id).eq('fecha', hoy).order('hora_inicio'),
      supabase.from('tpv').select('importe').eq('negocio_id', negocio.id)
        .gte('created_at', hoy + 'T00:00:00'),
      supabase.from('tpv').select('importe').eq('negocio_id', negocio.id)
        .gte('created_at', inicioMes + 'T00:00:00'),
      supabase.from('tpv').select('importe').eq('negocio_id', negocio.id),
      supabase.from('reservas').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id).eq('fecha', hoy),
      supabase.from('reservas').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id).gte('fecha', inicioMes),
      supabase.from('reservas').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id).eq('estado', 'cancelada').eq('fecha', hoy),
      supabase.from('reservas').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id).eq('estado', 'pendiente'),
      supabase.from('clientes').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id),
      supabase.from('clientes').select('*', { count:'exact', head:true })
        .eq('negocio_id', negocio.id).gte('created_at', inicioMes + 'T00:00:00'),
      supabase.from('empleados').select('*').eq('negocio_id', negocio.id).eq('activo', true),
    ]);

    if (reservasRes.data) setReservasHoy(reservasRes.data);
    if (empsRes.data) setEmpleados(empsRes.data);

    const sumarImportes = (data) => (data || []).reduce((a, t) => a + (t.importe || 0), 0);

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

  if (loading || cargando) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  const hoyStr = new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const nombreNegocio = negocio?.nombre || 'tu negocio';
  const slug = negocio?.slug || '';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 32px', height:60, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Inicio</div>
        <div style={{ background:'#EAF5EF', padding:'3px 10px', borderRadius:20, fontSize:12, color:'#6B9080', fontFamily:'DM Mono, monospace', textTransform:'capitalize' }}>
          {hoyStr}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={() => navigate('/agenda')}
            style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            📅 Ver agenda
          </button>
          <button onClick={() => navigate('/reservas')}
            style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + Nueva reserva
          </button>
        </div>
      </div>

      <div style={{ padding:32, display:'flex', flexDirection:'column', gap:20 }}>

        {/* Saludo */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:700, color:'#0B1E16', letterSpacing:-0.5 }}>
              {saludo}, {nombreNegocio} 👋
            </h1>
            <p style={{ fontSize:13.5, color:'#6B9080', marginTop:4 }}>
              {stats.hoy > 0
                ? `Tienes ${stats.hoy} citas hoy y ${stats.pendientes} pendientes de confirmar.`
                : 'No tienes citas hoy. ¡Buen momento para configurar tu perfil!'}
            </p>
          </div>
          {slug && (
            <div onClick={() => window.open(`/reservar/${slug}`, '_blank')}
              style={{ display:'flex', alignItems:'center', gap:6, background:'#E8F7F2', border:'1px solid #D6EDE5', color:'#063D2A', fontSize:12, fontWeight:600, padding:'6px 14px', borderRadius:20, cursor:'pointer' }}>
              <span style={{ width:7, height:7, background:'#0A9E6E', borderRadius:'50%', display:'inline-block' }} />
              reservly.com/{slug}
            </div>
          )}
        </div>

        {/* Stats fila 1 — Reservas */}
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>Reservas</div>
          <div style={{ display:'flex', gap:14 }}>
            <StatCard featured value={stats.hoy}       label="Citas hoy"    sub="reservas de hoy" />
            <StatCard         value={stats.mes}        label="Este mes"     sub="reservas totales" onClick={() => navigate('/reservas')} />
            <StatCard         value={stats.pendientes} label="Pendientes"   sub="sin confirmar"   onClick={() => navigate('/reservas')} />
            <StatCard         value={stats.canceladas} label="Canceladas"   sub="hoy" />
          </div>
        </div>

        {/* Stats fila 2 — Facturación */}
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>Facturación</div>
          <div style={{ display:'flex', gap:14 }}>
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:20, flex:1 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>Hoy</div>
              <div style={{ fontSize:28, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace', letterSpacing:-0.5 }}>{stats.facturacionHoy.toFixed(2)}</div>
              <div style={{ fontSize:11.5, color:'#6B9080', marginTop:4 }}>EUR cobrados hoy</div>
            </div>
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:20, flex:1 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>Este mes</div>
              <div style={{ fontSize:28, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace', letterSpacing:-0.5 }}>{stats.facturacionMes.toFixed(2)}</div>
              <div style={{ fontSize:11.5, color:'#6B9080', marginTop:4 }}>EUR cobrados este mes</div>
            </div>
            <div style={{ background:'#063D2A', border:'1px solid #EAF5EF', borderRadius:14, padding:20, flex:1 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#ffffff60', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>Total acumulado</div>
              <div style={{ fontSize:28, fontWeight:700, color:'#fff', fontFamily:'DM Mono, monospace', letterSpacing:-0.5 }}>{stats.facturacionTotal.toFixed(2)}</div>
              <div style={{ fontSize:11.5, color:'#0A9E6E', marginTop:4 }}>EUR facturados en total</div>
            </div>
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:20, flex:1 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>Clientes</div>
              <div style={{ fontSize:28, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace', letterSpacing:-0.5 }}>{stats.clientesTotal}</div>
              <div style={{ fontSize:11.5, color:'#6B9080', marginTop:4 }}>+{stats.clientesMes} este mes</div>
            </div>
          </div>
        </div>

        {/* Middle */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16 }}>

          {/* Agenda hoy */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid #EAF5EF', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>Agenda de hoy</div>
                <div style={{ fontSize:12, color:'#6B9080', marginTop:1, textTransform:'capitalize' }}>{hoyStr} — {stats.hoy} citas</div>
              </div>
              <span onClick={() => navigate('/agenda')} style={{ fontSize:12, fontWeight:600, color:'#0A9E6E', cursor:'pointer' }}>
                Ver semana →
              </span>
            </div>
            <div style={{ padding:'16px 20px' }}>
              {reservasHoy.length > 0 ? (
                reservasHoy.map(r => (
                  <AptRow
                    key={r.id}
                    nombre={r.clientes?.nombre || 'Cliente'}
                    servicio={r.servicios?.nombre || 'Servicio'}
                    empleado={r.empleados?.nombre || 'Empleado'}
                    hora_inicio={r.hora_inicio?.slice(0,5)}
                    hora_fin={r.hora_fin?.slice(0,5)}
                    estado={r.estado}
                  />
                ))
              ) : (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#A8C4B8' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>📅</div>
                  <div style={{ fontSize:14 }}>No hay reservas para hoy</div>
                  <div style={{ fontSize:12, marginTop:4 }}>Las reservas aparecerán aquí</div>
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Empleados */}
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:14 }}>
                Empleados activos
              </div>
              {empleados.length > 0 ? (
                empleados.map(e => (
                  <div key={e.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #EAF5EF' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:500, color:'#0B1E16' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background: e.color || '#0A9E6E' }} />
                      {e.nombre}
                    </div>
                    <div style={{ fontSize:11, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>activo</div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign:'center', padding:'20px 0', color:'#A8C4B8', fontSize:13 }}>
                  Sin empleados aún
                </div>
              )}
            </div>

            {/* Accesos rápidos */}
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>
                Accesos rápidos
              </div>
              {[
                { label:'Ver todas las reservas', ruta:'/reservas',     emoji:'📅' },
                { label:'Gestionar clientes',     ruta:'/clientes',     emoji:'👤' },
                { label:'Ver estadísticas',       ruta:'/estadisticas', emoji:'📈' },
                { label:'Configurar ajustes',     ruta:'/ajustes',      emoji:'⚙️' },
              ].map(a => (
                <div key={a.ruta} onClick={() => navigate(a.ruta)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, cursor:'pointer', marginBottom:4 }}
                  onMouseEnter={e => e.currentTarget.style.background='#F4FAF7'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <span style={{ fontSize:14 }}>{a.emoji}</span>
                  <span style={{ fontSize:13, color:'#0B1E16', fontWeight:500 }}>{a.label}</span>
                  <span style={{ marginLeft:'auto', fontSize:12, color:'#A8C4B8' }}>→</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}