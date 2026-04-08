import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';

const PERIODOS = ['Esta semana', 'Este mes', 'Este año'];

export default function Estadisticas() {
  const { negocio } = useNegocio();
  const [periodo, setPeriodo] = useState('Este mes');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservas: 0, completadas: 0, canceladas: 0, pendientes: 0,
    facturacion: 0, ticketMedio: 0, totalClientes: 0, nuevosClientes: 0,
    reservasPorDia: [], serviciosTop: [], empleadosTop: [],
  });

  useEffect(() => {
    if (!negocio) return;
    fetchStats();
  }, [negocio, periodo]);

  const getFechaInicio = () => {
    const hoy = new Date();
    if (periodo === 'Esta semana') {
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
      return lunes.toISOString().split('T')[0];
    }
    if (periodo === 'Este mes') return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    return new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
  };

  const fetchStats = async () => {
    setLoading(true);
    const fechaInicio = getFechaInicio();
    const fechaFin = new Date().toISOString().split('T')[0];

    const [resRes, cliRes, tpvRes] = await Promise.all([
      supabase.from('reservas').select(`*, servicios(nombre, precio), empleados(nombre, color), clientes(nombre)`)
        .eq('negocio_id', negocio.id).gte('fecha', fechaInicio).lte('fecha', fechaFin),
      supabase.from('clientes').select('id, created_at').eq('negocio_id', negocio.id),
      supabase.from('tpv').select('importe, created_at').eq('negocio_id', negocio.id)
        .gte('created_at', fechaInicio),
    ]);

    const reservas = resRes.data || [];
    const clientes = cliRes.data || [];
    const tpvData  = tpvRes.data || [];

    const completadas = reservas.filter(r => r.estado === 'completada');
    const canceladas  = reservas.filter(r => r.estado === 'cancelada');
    const pendientes  = reservas.filter(r => r.estado === 'pendiente');

    const facturacion = tpvData.reduce((a, t) => a + (t.importe || 0), 0);
    const ticketMedio = completadas.length > 0 ? facturacion / completadas.length : 0;

    const nuevosClientes = clientes.filter(c => c.created_at >= fechaInicio + 'T00:00:00').length;

    // Reservas por día
    const porDia = {};
    reservas.forEach(r => {
      porDia[r.fecha] = (porDia[r.fecha] || 0) + 1;
    });
    const reservasPorDia = Object.entries(porDia)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([fecha, count]) => ({ fecha: fecha.slice(5), count }));

    // Servicios top
    const porServicio = {};
    completadas.forEach(r => {
      const nombre = r.servicios?.nombre || 'Sin servicio';
      if (!porServicio[nombre]) porServicio[nombre] = { count: 0, facturado: 0 };
      porServicio[nombre].count += 1;
      porServicio[nombre].facturado += r.precio_final || r.servicios?.precio || 0;
    });
    const serviciosTop = Object.entries(porServicio)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([nombre, data]) => ({ nombre, ...data }));

    // Empleados top
    const porEmpleado = {};
    completadas.forEach(r => {
      if (!r.empleados) return;
      const nombre = r.empleados.nombre;
      const color  = r.empleados.color;
      if (!porEmpleado[nombre]) porEmpleado[nombre] = { count: 0, facturado: 0, color };
      porEmpleado[nombre].count += 1;
      porEmpleado[nombre].facturado += r.precio_final || r.servicios?.precio || 0;
    });
    const empleadosTop = Object.entries(porEmpleado)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([nombre, data]) => ({ nombre, ...data }));

    setStats({
      totalReservas: reservas.length,
      completadas: completadas.length,
      canceladas: canceladas.length,
      pendientes: pendientes.length,
      facturacion, ticketMedio,
      totalClientes: clientes.length,
      nuevosClientes,
      reservasPorDia, serviciosTop, empleadosTop,
    });
    setLoading(false);
  };

  const maxCount = Math.max(...stats.reservasPorDia.map(d => d.count), 1);
  const maxServicio = Math.max(...stats.serviciosTop.map(s => s.count), 1);

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando estadísticas...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 32px', height:60, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Estadísticas</div>
        <div style={{ marginLeft:'auto' }}>
          <div style={{ display:'flex', background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden' }}>
            {PERIODOS.map(p => (
              <button key={p} onClick={() => setPeriodo(p)} style={{
                padding:'7px 16px', fontSize:12.5, fontWeight:500,
                color: periodo===p ? '#fff' : '#6B9080',
                background: periodo===p ? '#0A9E6E' : 'transparent',
                border:'none', borderRight:'1px solid #D6EDE5', cursor:'pointer',
              }}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:32, display:'flex', flexDirection:'column', gap:20 }}>

        {/* KPIs principales */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { label:'Reservas totales',  value: stats.totalReservas, sub:`${stats.completadas} completadas`, color:'#0B1E16' },
            { label:'Facturación',       value: stats.facturacion.toFixed(2) + ' EUR', sub:'cobrado via TPV', color:'#0A9E6E' },
            { label:'Ticket medio',      value: stats.ticketMedio.toFixed(2) + ' EUR', sub:'por cita', color:'#0B1E16' },
            { label:'Clientes nuevos',   value: stats.nuevosClientes, sub:`de ${stats.totalClientes} totales`, color:'#0B1E16' },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:700, color:s.color, fontFamily:'DM Mono, monospace', letterSpacing:-0.5 }}>{s.value}</div>
              <div style={{ fontSize:11.5, color:'#6B9080', marginTop:4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Estado de reservas */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { label:'Completadas', value: stats.completadas, bg:'#E8F7F2', color:'#063D2A', pct: stats.totalReservas > 0 ? Math.round(stats.completadas/stats.totalReservas*100) : 0 },
            { label:'Pendientes',  value: stats.pendientes,  bg:'#FFF8E7', color:'#92400E', pct: stats.totalReservas > 0 ? Math.round(stats.pendientes/stats.totalReservas*100) : 0 },
            { label:'Canceladas',  value: stats.canceladas,  bg:'#FEF2F2', color:'#EF4444', pct: stats.totalReservas > 0 ? Math.round(stats.canceladas/stats.totalReservas*100) : 0 },
            { label:'Tasa éxito',  value: stats.totalReservas > 0 ? Math.round(stats.completadas/stats.totalReservas*100) + '%' : '—', bg:'#EFF6FF', color:'#1E40AF', pct: stats.totalReservas > 0 ? Math.round(stats.completadas/stats.totalReservas*100) : 0 },
          ].map(s => (
            <div key={s.label} style={{ background:s.bg, border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 18px' }}>
              <div style={{ fontSize:11, color:s.color, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8, opacity:0.7 }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:700, color:s.color, fontFamily:'DM Mono, monospace' }}>{s.value}</div>
              <div style={{ marginTop:8, height:4, background:'#ffffff60', borderRadius:2, overflow:'hidden' }}>
                <div style={{ width:`${s.pct}%`, height:'100%', background:s.color, borderRadius:2, opacity:0.6 }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico reservas por día */}
        {stats.reservasPorDia.length > 0 && (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'20px 24px' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:20 }}>Reservas por día</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:120 }}>
              {stats.reservasPorDia.map((d, i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ fontSize:10, color:'#6B9080', fontFamily:'DM Mono, monospace', fontWeight:600 }}>{d.count}</div>
                  <div style={{
                    width:'100%', borderRadius:'4px 4px 0 0',
                    background: d.count > 0 ? '#0A9E6E' : '#EAF5EF',
                    height: `${Math.max(4, (d.count / maxCount) * 100)}px`,
                    transition:'height 0.3s',
                  }}/>
                  <div style={{ fontSize:9.5, color:'#A8C4B8', fontFamily:'DM Mono, monospace' }}>{d.fecha}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

          {/* Servicios más populares */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', fontSize:14, fontWeight:700, color:'#0B1E16' }}>
              Servicios más populares
            </div>
            {stats.serviciosTop.length > 0 ? (
              <div style={{ padding:'14px 20px', display:'flex', flexDirection:'column', gap:12 }}>
                {stats.serviciosTop.map((s, i) => (
                  <div key={i}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{s.nombre}</span>
                      <div style={{ display:'flex', gap:12 }}>
                        <span style={{ fontSize:12, color:'#6B9080', fontFamily:'DM Mono, monospace' }}>{s.count} citas</span>
                        <span style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>{s.facturado.toFixed(0)} EUR</span>
                      </div>
                    </div>
                    <div style={{ height:6, background:'#EAF5EF', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ width:`${(s.count/maxServicio)*100}%`, height:'100%', background:'#0A9E6E', borderRadius:3 }}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding:'30px', textAlign:'center', color:'#A8C4B8', fontSize:13 }}>Sin datos aún</div>
            )}
          </div>

          {/* Rendimiento empleados */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', fontSize:14, fontWeight:700, color:'#0B1E16' }}>
              Rendimiento por empleado
            </div>
            {stats.empleadosTop.length > 0 ? (
              <div style={{ padding:'0' }}>
                {stats.empleadosTop.map((e, i) => (
                  <div key={i} style={{ padding:'14px 20px', borderBottom: i<stats.empleadosTop.length-1?'1px solid #EAF5EF':'none', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:e.color||'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {e.nombre[0]}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{e.nombre}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>{e.facturado.toFixed(0)} EUR</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:11.5, color:'#6B9080' }}>{e.count} citas completadas</span>
                        <span style={{ fontSize:11.5, color:'#6B9080', fontFamily:'DM Mono, monospace' }}>
                          {e.count > 0 ? (e.facturado/e.count).toFixed(0) : 0} EUR/cita
                        </span>
                      </div>
                      <div style={{ height:4, background:'#EAF5EF', borderRadius:2, overflow:'hidden' }}>
                        <div style={{ width:`${(e.count/Math.max(...stats.empleadosTop.map(x=>x.count),1))*100}%`, height:'100%', background:e.color||'#0A9E6E', borderRadius:2 }}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding:'30px', textAlign:'center', color:'#A8C4B8', fontSize:13 }}>Sin datos aún</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}