import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = 'ivanpascual100@gmail.com';

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [negocios, setNegocios] = useState([]);
  const [stats, setStats] = useState({
    totalNegocios:0, negociosActivos:0, totalReservas:0,
    totalClientes:0, reservasHoy:0, negociosConReservas:0,
  });
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    verificarAdmin();
  }, []);

  const verificarAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/dashboard');
      return;
    }
    setAutorizado(true);
    fetchData();
  };

  const fetchData = async () => {
    const hoy = new Date().toISOString().split('T')[0];
    const hace30dias = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];

    const [negRes, resRes, cliRes, resHoyRes] = await Promise.all([
      supabase.from('negocios').select('*').order('created_at', { ascending:false }),
      supabase.from('reservas').select('negocio_id', { count:'exact' }),
      supabase.from('clientes').select('id', { count:'exact' }),
      supabase.from('reservas').select('id', { count:'exact' }).eq('fecha', hoy),
    ]);

    const negociosList = negRes.data || [];

    // Para cada negocio, sacar sus reservas del último mes
    const negociosConStats = await Promise.all(negociosList.map(async (n) => {
      const [resN, cliN, resRecientes] = await Promise.all([
        supabase.from('reservas').select('id', { count:'exact', head:true }).eq('negocio_id', n.id),
        supabase.from('clientes').select('id', { count:'exact', head:true }).eq('negocio_id', n.id),
        supabase.from('reservas').select('id', { count:'exact', head:true })
          .eq('negocio_id', n.id).gte('created_at', hace30dias + 'T00:00:00'),
      ]);
      return {
        ...n,
        total_reservas: resN.count || 0,
        total_clientes: cliN.count || 0,
        reservas_mes:   resRecientes.count || 0,
        activo_real:    (resRecientes.count || 0) > 0,
      };
    }));

    setNegocios(negociosConStats);
    setStats({
      totalNegocios:      negociosList.length,
      negociosActivos:    negociosConStats.filter(n => n.activo_real).length,
      totalReservas:      resRes.count || 0,
      totalClientes:      cliRes.count || 0,
      reservasHoy:        resHoyRes.count || 0,
      negociosConReservas: negociosConStats.filter(n => n.total_reservas > 0).length,
    });
    setLoading(false);
  };

  const filtrados = negocios.filter(n => {
    if (filtro === 'activos')    return n.activo_real;
    if (filtro === 'inactivos')  return !n.activo_real;
    if (filtro === 'sin_reservas') return n.total_reservas === 0;
    return true;
  });

  if (!autorizado || loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#F4FAF7' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando panel de administración...</div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F4FAF7', fontFamily:'DM Sans, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background:'#063D2A', padding:'0 28px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
              stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="white"/>
            <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
          </svg>
          <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Reservly</span>
          <span style={{ fontSize:11, background:'#EF4444', color:'#fff', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>ADMIN</span>
        </div>
        <button onClick={() => navigate('/dashboard')}
          style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.7)', padding:'6px 14px', borderRadius:8, fontSize:13, cursor:'pointer' }}>
          ← Volver al panel
        </button>
      </div>

      <div style={{ padding:'28px 28px', display:'flex', flexDirection:'column', gap:20, maxWidth:1200, margin:'0 auto' }}>

        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0B1E16', margin:0 }}>Panel de administración</h1>
          <p style={{ fontSize:13, color:'#6B9080', marginTop:4 }}>Vista global de todos los negocios en Reservly</p>
        </div>

        {/* KPIs globales */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:10 }}>
          {[
            { label:'Negocios totales',    value: stats.totalNegocios,      featured:true },
            { label:'Activos este mes',    value: stats.negociosActivos,     color:'#0A9E6E' },
            { label:'Con alguna reserva',  value: stats.negociosConReservas, color:'#3B82F6' },
            { label:'Reservas totales',    value: stats.totalReservas },
            { label:'Clientes totales',    value: stats.totalClientes },
            { label:'Reservas hoy',        value: stats.reservasHoy,         color:'#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ background: s.featured ? '#063D2A' : '#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:10.5, color: s.featured ? '#ffffff60' : '#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:700, color: s.featured ? '#fff' : (s.color || '#0B1E16'), fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[
            { k:'todos',       label:`Todos (${negocios.length})` },
            { k:'activos',     label:`Activos este mes (${stats.negociosActivos})` },
            { k:'inactivos',   label:`Sin actividad (${negocios.length - stats.negociosActivos})` },
            { k:'sin_reservas',label:`Sin reservas (${negocios.length - stats.negociosConReservas})` },
          ].map(f => (
            <button key={f.k} onClick={() => setFiltro(f.k)} style={{
              padding:'7px 14px', fontSize:12.5, fontWeight:500,
              color: filtro===f.k ? '#fff' : '#6B9080',
              background: filtro===f.k ? '#0A9E6E' : '#fff',
              border:`1px solid ${filtro===f.k ? '#0A9E6E' : '#D6EDE5'}`,
              borderRadius:8, cursor:'pointer',
            }}>{f.label}</button>
          ))}
        </div>

        {/* Tabla negocios */}
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 100px', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
            {['Negocio','Email','Tipo','Reservas','Clientes','Mes','Estado'].map(h => (
              <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
            ))}
          </div>
          {filtrados.map((n, i) => (
            <div key={n.id} style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 100px', padding:'14px 20px', borderBottom: i<filtrados.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center' }}
              onMouseEnter={e=>e.currentTarget.style.background='#F4FAF7'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <div>
                <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{n.nombre}</div>
                <div style={{ fontSize:11, color:'#A8C4B8', fontFamily:'DM Mono, monospace', marginTop:1 }}>
                  {new Date(n.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
              <div style={{ fontSize:12, color:'#6B9080', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.email || '—'}</div>
              <div>
                <span style={{ fontSize:11, fontWeight:600, padding:'2px 7px', borderRadius:20,
                  background: n.tipo==='profesional' ? '#E8F7F2' : n.tipo==='recurso' ? '#EFF6FF' : '#F5F3FF',
                  color: n.tipo==='profesional' ? '#063D2A' : n.tipo==='recurso' ? '#1E40AF' : '#5B21B6',
                }}>
                  {n.tipo || 'simple'}
                </span>
              </div>
              <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#0B1E16', fontWeight:600 }}>{n.total_reservas}</div>
              <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#0B1E16' }}>{n.total_clientes}</div>
              <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color: n.reservas_mes > 0 ? '#0A9E6E' : '#A8C4B8', fontWeight: n.reservas_mes > 0 ? 600 : 400 }}>
                {n.reservas_mes}
              </div>
              <div>
                {n.activo_real ? (
                  <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:'#E8F7F2', color:'#063D2A' }}>● Activo</span>
                ) : (
                  <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:'#F1F5F9', color:'#6B9080' }}>○ Inactivo</span>
                )}
              </div>
            </div>
          ))}
          {filtrados.length === 0 && (
            <div style={{ padding:40, textAlign:'center', color:'#A8C4B8', fontSize:14 }}>
              No hay negocios con este filtro
            </div>
          )}
        </div>

        {/* Últimos registros */}
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:20 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:14 }}>Últimos 5 registros</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {negocios.slice(0,5).map(n => (
              <div key={n.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'#F4FAF7', borderRadius:8 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#063D2A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {n.nombre?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{n.nombre}</div>
                  <div style={{ fontSize:12, color:'#6B9080' }}>{n.email || 'Sin email'}</div>
                </div>
                <div style={{ fontSize:11, color:'#A8C4B8', fontFamily:'DM Mono, monospace' }}>
                  {new Date(n.created_at).toLocaleDateString('es-ES')}
                </div>
                <div style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20,
                  background: n.onboarding_completado ? '#E8F7F2' : '#FFF8E7',
                  color: n.onboarding_completado ? '#063D2A' : '#92400E',
                }}>
                  {n.onboarding_completado ? 'Activo' : 'Onboarding'}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}