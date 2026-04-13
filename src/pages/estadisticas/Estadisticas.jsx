import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';

const BarraProgreso = ({ valor, max, color = '#0A9E6E' }) => (
  <div style={{ background:'#EAF5EF', borderRadius:4, height:8, overflow:'hidden' }}>
    <div style={{ width: max > 0 ? `${Math.min(100, (valor/max)*100)}%` : '0%', height:'100%', background:color, borderRadius:4, transition:'width 0.5s ease' }}/>
  </div>
);

const GraficoBarras = ({ datos, color = '#0A9E6E' }) => {
  const max = Math.max(...datos.map(d => d.valor), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:140, padding:'0 4px' }}>
      {datos.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }}>
          <div style={{ fontSize:10, color:'#6B9080', fontFamily:'DM Mono, monospace', fontWeight:500 }}>
            {d.valor > 0 ? (d.valor >= 1000 ? `${(d.valor/1000).toFixed(1)}k` : d.valor.toFixed(0)) : ''}
          </div>
          <div style={{ width:'100%', background: color, borderRadius:'4px 4px 0 0', height:`${Math.max(4, (d.valor/max)*110)}px`, transition:'height 0.5s ease', opacity: i === datos.length-1 ? 1 : 0.6 }}/>
          <div style={{ fontSize:10, color:'#A8C4B8', fontWeight:500, whiteSpace:'nowrap' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

export default function Estadisticas() {
  const { negocio } = useNegocio();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');
  const [stats, setStats] = useState({
    totalReservas:0, totalFacturado:0, ticketMedio:0,
    tasaCancelacion:0, clientesNuevos:0, totalClientes:0,
    serviciosTop:[], empleadosTop:[], reservasPorDia:[],
    reservasPorEstado:{}, facturacionPorMes:[],
    horasPico:[],
  });

  useEffect(() => {
    if (!negocio) return;
    fetchStats();
  }, [negocio, periodo]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    setLoading(true);
    const hoy = new Date();
    let fechaInicio;

    if (periodo === 'semana') {
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - hoy.getDay() + 1);
      fechaInicio = lunes.toISOString().split('T')[0];
    } else if (periodo === 'mes') {
      fechaInicio = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-01`;
    } else {
      fechaInicio = `${hoy.getFullYear()}-01-01`;
    }

    const fechaFin = hoy.toISOString().split('T')[0];

    // Para el gráfico de facturación por mes, siempre cogemos el año completo
    const inicioAño = `${hoy.getFullYear()}-01-01`;

    const [reservasRes, tpvRes, tpvAñoRes, clientesRes, clientesTotalRes] = await Promise.all([
      supabase.from('reservas').select('*, servicios(nombre, precio), empleados(nombre, color), clientes(nombre)')
        .eq('negocio_id', negocio.id).gte('fecha', fechaInicio).lte('fecha', fechaFin),
      supabase.from('tpv').select('importe, reserva_id, created_at')
        .eq('negocio_id', negocio.id)
        .gte('created_at', fechaInicio + 'T00:00:00')
        .lte('created_at', fechaFin + 'T23:59:59'),
      supabase.from('tpv').select('importe, created_at')
        .eq('negocio_id', negocio.id)
        .gte('created_at', inicioAño + 'T00:00:00'),
      supabase.from('clientes').select('id', { count:'exact' })
        .eq('negocio_id', negocio.id).gte('created_at', fechaInicio + 'T00:00:00'),
      supabase.from('clientes').select('id', { count:'exact' })
        .eq('negocio_id', negocio.id),
    ]);

    const reservas   = reservasRes.data || [];
    const tpv        = tpvRes.data      || [];
    const tpvAño     = tpvAñoRes.data   || [];

    const totalFacturado = tpv.reduce((a, t) => a + (t.importe||0), 0);
    const completadas    = reservas.filter(r => r.estado === 'completada');
    const canceladas     = reservas.filter(r => r.estado === 'cancelada');
    const ticketMedio    = completadas.length > 0 ? totalFacturado / completadas.length : 0;
    const tasaCancelacion = reservas.length > 0 ? Math.round(canceladas.length / reservas.length * 100) : 0;

    // Facturación por mes (año completo)
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const facturacionPorMes = meses.map((label, i) => {
      const valor = tpvAño
        .filter(t => new Date(t.created_at).getMonth() === i)
        .reduce((a, t) => a + (t.importe||0), 0);
      return { label, valor };
    }).slice(0, hoy.getMonth()+1);

    // Servicios top
    const serviciosMap = {};
    reservas.filter(r => r.servicios).forEach(r => {
      const nombre = r.servicios.nombre;
      if (!serviciosMap[nombre]) serviciosMap[nombre] = { nombre, count:0, facturado:0 };
      serviciosMap[nombre].count++;
      const t = tpv.find(t => t.reserva_id === r.id);
      serviciosMap[nombre].facturado += t?.importe || r.servicios?.precio || 0;
    });
    const serviciosTop = Object.values(serviciosMap).sort((a,b) => b.count-a.count).slice(0,5);

    // Empleados top
    const empleadosMap = {};
    reservas.filter(r => r.empleados).forEach(r => {
      const nombre = r.empleados.nombre;
      const color  = r.empleados.color;
      if (!empleadosMap[nombre]) empleadosMap[nombre] = { nombre, color, count:0, facturado:0 };
      empleadosMap[nombre].count++;
      const t = tpv.find(t => t.reserva_id === r.id);
      empleadosMap[nombre].facturado += t?.importe || r.servicios?.precio || 0;
    });
    const empleadosTop = Object.values(empleadosMap).sort((a,b) => b.count-a.count).slice(0,5);

    // Reservas por día de la semana
    const diasLabels = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    const porDia = [0,0,0,0,0,0,0];
    reservas.forEach(r => {
      if (!r.fecha) return;
      const d = new Date(r.fecha + 'T12:00:00');
      const idx = d.getDay() === 0 ? 6 : d.getDay()-1;
      porDia[idx]++;
    });
    const reservasPorDia = diasLabels.map((label, i) => ({ label, count:porDia[i] }));

    // Horas pico
    const porHora = {};
    reservas.forEach(r => {
      if (!r.hora_inicio) return;
      const hora = r.hora_inicio.slice(0,2) + ':00';
      porHora[hora] = (porHora[hora]||0) + 1;
    });
    const horasPico = Object.entries(porHora)
      .map(([hora, count]) => ({ hora, count }))
      .sort((a,b) => b.count-a.count).slice(0,3);

    // Por estado
    const reservasPorEstado = {
      confirmada: reservas.filter(r=>r.estado==='confirmada').length,
      pendiente:  reservas.filter(r=>r.estado==='pendiente').length,
      completada: completadas.length,
      cancelada:  canceladas.length,
    };

    setStats({
      totalReservas: reservas.length, totalFacturado, ticketMedio,
      tasaCancelacion, clientesNuevos: clientesRes.count||0,
      totalClientes: clientesTotalRes.count||0,
      serviciosTop, empleadosTop, reservasPorDia,
      reservasPorEstado, facturacionPorMes, horasPico,
    });
    setLoading(false);
  };

  const pad = isMobile ? 16 : 32;
  const maxDia      = Math.max(...stats.reservasPorDia.map(d => d.count), 1);
  const maxServicio  = Math.max(...stats.serviciosTop.map(s => s.count), 1);
  const maxEmpleado  = Math.max(...stats.empleadosTop.map(e => e.count), 1);

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando estadísticas...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Estadísticas</div>
        <div style={{ marginLeft:'auto', display:'flex', background:'#F4FAF7', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden' }}>
          {[
            { k:'semana', label:'Semana' },
            { k:'mes',    label:'Mes'    },
            { k:'año',    label:'Año'    },
          ].map(p => (
            <button key={p.k} onClick={() => setPeriodo(p.k)} style={{
              padding:'6px 14px', fontSize:12.5, fontWeight:500,
              color: periodo===p.k ? '#fff' : '#6B9080',
              background: periodo===p.k ? '#0A9E6E' : 'transparent',
              border:'none', borderRight:'1px solid #D6EDE5', cursor:'pointer',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:pad, display:'flex', flexDirection:'column', gap:16 }}>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap:10 }}>
          {[
            { label:'Total reservas',   value: stats.totalReservas,                       mono:true },
            { label:'Facturación',      value: `${stats.totalFacturado.toFixed(2)} EUR`,  mono:true, featured:true },
            { label:'Ticket medio',     value: `${stats.ticketMedio.toFixed(2)} EUR`,     mono:true },
            { label:'Tasa cancelación', value: `${stats.tasaCancelacion}%`,               mono:true, warning: stats.tasaCancelacion > 20 },
            { label:'Clientes nuevos',  value: stats.clientesNuevos,                      mono:true },
            { label:'Total clientes',   value: stats.totalClientes,                       mono:true },
          ].map(s => (
            <div key={s.label} style={{ background: s.featured ? '#063D2A' : '#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color: s.featured ? '#ffffff60' : '#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:700, color: s.featured ? '#fff' : s.warning ? '#EF4444' : '#0B1E16', fontFamily: s.mono ? 'DM Mono, monospace' : 'inherit' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Gráfico facturación por mes */}
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding: isMobile ? 16 : 24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>Facturación por mes</div>
              <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>{new Date().getFullYear()}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:18, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>
                {stats.facturacionPorMes.reduce((a,m) => a+m.valor, 0).toFixed(0)} EUR
              </div>
              <div style={{ fontSize:11, color:'#6B9080' }}>total año</div>
            </div>
          </div>
          {stats.facturacionPorMes.length > 0 ? (
            <GraficoBarras datos={stats.facturacionPorMes} color="#0A9E6E" />
          ) : (
            <div style={{ textAlign:'center', padding:'30px 0', color:'#A8C4B8', fontSize:13 }}>Sin datos de facturación aún</div>
          )}
        </div>

        {/* Estados + horas pico */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap:16 }}>

          {/* Estados */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding: isMobile ? 16 : 20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:14 }}>Reservas por estado</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Confirmadas', value: stats.reservasPorEstado.confirmada||0, color:'#0A9E6E', bg:'#E8F7F2' },
                { label:'Pendientes',  value: stats.reservasPorEstado.pendiente ||0, color:'#F59E0B', bg:'#FFF8E7' },
                { label:'Completadas', value: stats.reservasPorEstado.completada||0, color:'#6B9080', bg:'#F1F5F9' },
                { label:'Canceladas',  value: stats.reservasPorEstado.cancelada ||0, color:'#EF4444', bg:'#FEF2F2' },
              ].map(e => (
                <div key={e.label} style={{ background:e.bg, borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:24, fontWeight:700, color:e.color, fontFamily:'DM Mono, monospace' }}>{e.value}</div>
                  <div style={{ fontSize:12, color:e.color, fontWeight:600 }}>{e.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Horas pico */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding: isMobile ? 16 : 20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:14 }}>Horas más demandadas</div>
            {stats.horasPico.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {stats.horasPico.map((h, i) => (
                  <div key={h.hora} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background: i===0 ? '#E8F7F2' : '#F4FAF7', borderRadius:10 }}>
                    <div style={{ fontSize:18, fontWeight:800, color: i===0 ? '#0A9E6E' : '#A8C4B8', fontFamily:'DM Mono, monospace' }}>#{i+1}</div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{h.hora}</div>
                      <div style={{ fontSize:12, color:'#6B9080' }}>{h.count} reservas</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'20px 0', color:'#A8C4B8', fontSize:13 }}>Sin datos aún</div>
            )}
          </div>

        </div>

        {/* Actividad por día */}
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding: isMobile ? 16 : 20 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>Actividad por día de la semana</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {stats.reservasPorDia.map(d => (
              <div key={d.label} style={{ display:'grid', gridTemplateColumns:'40px 1fr 30px', gap:10, alignItems:'center' }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'#6B9080' }}>{d.label}</div>
                <BarraProgreso valor={d.count} max={maxDia} />
                <div style={{ fontSize:12.5, fontFamily:'DM Mono, monospace', color:'#0B1E16', textAlign:'right' }}>{d.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top servicios y empleados */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16 }}>

          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding: isMobile ? 16 : 20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>Servicios más populares</div>
            {stats.serviciosTop.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {stats.serviciosTop.map((s, i) => (
                  <div key={s.nombre}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:'#A8C4B8', fontFamily:'DM Mono, monospace' }}>#{i+1}</span>
                        <span style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{s.nombre}</span>
                      </div>
                      <div style={{ display:'flex', gap:10 }}>
                        <span style={{ fontSize:12, color:'#6B9080', fontFamily:'DM Mono, monospace' }}>{s.count} citas</span>
                        <span style={{ fontSize:12, color:'#0A9E6E', fontFamily:'DM Mono, monospace', fontWeight:600 }}>{s.facturado.toFixed(0)} EUR</span>
                      </div>
                    </div>
                    <BarraProgreso valor={s.count} max={maxServicio} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'20px 0', color:'#A8C4B8', fontSize:13 }}>Sin datos aún</div>
            )}
          </div>

          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding: isMobile ? 16 : 20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>Rendimiento por empleado</div>
            {stats.empleadosTop.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {stats.empleadosTop.map((e, i) => (
                  <div key={e.nombre}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:e.color||'#0A9E6E', flexShrink:0 }}/>
                        <span style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{e.nombre}</span>
                      </div>
                      <div style={{ display:'flex', gap:10 }}>
                        <span style={{ fontSize:12, color:'#6B9080', fontFamily:'DM Mono, monospace' }}>{e.count} citas</span>
                        <span style={{ fontSize:12, fontFamily:'DM Mono, monospace', fontWeight:600, color:e.color||'#0A9E6E' }}>{e.facturado.toFixed(0)} EUR</span>
                      </div>
                    </div>
                    <BarraProgreso valor={e.count} max={maxEmpleado} color={e.color||'#0A9E6E'} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'20px 0', color:'#A8C4B8', fontSize:13 }}>Sin datos aún</div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}