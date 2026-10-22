import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

export default function PerfilPublico() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [negocio, setNegocio] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchData();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    const { data: neg } = await supabase
      .from('negocios_publicos').select('*').eq('slug', slug).single();
    if (!neg) { setNotFound(true); setLoading(false); return; }
    setNegocio(neg);

    const [serRes, resenasRes] = await Promise.all([
      supabase.from('servicios').select('*').eq('negocio_id', neg.id).eq('activo', true),
      supabase.from('resenas').select('*, clientes(nombre)')
        .eq('negocio_id', neg.id).order('created_at', { ascending: false }),
    ]);

    if (serRes.data)    setServicios(serRes.data);
    if (resenasRes.data) setResenas(resenasRes.data);
    setLoading(false);
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F4FAF7' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F4FAF7', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:48 }}>🔍</div>
      <div style={{ fontSize:20, fontWeight:700, color:'#0B1E16' }}>Negocio no encontrado</div>
    </div>
  );

  const mediaEstrellas = resenas.length > 0
    ? (resenas.reduce((a, r) => a + r.puntuacion, 0) / resenas.length).toFixed(1)
    : null;

  const distribucion = [5,4,3,2,1].map(n => ({
    n,
    count: resenas.filter(r => r.puntuacion === n).length,
    pct: resenas.length > 0 ? (resenas.filter(r => r.puntuacion === n).length / resenas.length) * 100 : 0,
  }));

  return (
    <div style={{ minHeight:'100vh', background:'#F4FAF7', fontFamily:'DM Sans, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background:'#063D2A', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
              stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="white"/>
            <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
          </svg>
          <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Reservly</span>
        </div>
        <button onClick={() => navigate(`/reservar/${slug}`)}
          style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 18px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
          Reservar cita →
        </button>
      </div>

      {/* Hero negocio */}
      <div style={{ background:'linear-gradient(135deg, #063D2A 0%, #0A4D2E 100%)', padding:'40px 20px', textAlign:'center' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:700, color:'#fff', margin:'0 auto 16px', border:'3px solid rgba(255,255,255,0.3)' }}>
          {negocio.nombre?.[0]?.toUpperCase()}
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:'#fff', marginBottom:8, letterSpacing:-0.5 }}>{negocio.nombre}</h1>
        {negocio.descripcion && (
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.7)', maxWidth:500, margin:'0 auto 12px', lineHeight:1.6 }}>{negocio.descripcion}</p>
        )}
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', marginTop:12 }}>
          {negocio.direccion && (
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>📍 {negocio.direccion}</span>
          )}
          {negocio.telefono && (
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>📞 {negocio.telefono}</span>
          )}
        </div>
        {mediaEstrellas && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.1)', padding:'8px 16px', borderRadius:20, marginTop:16 }}>
            <span style={{ fontSize:20 }}>⭐</span>
            <span style={{ fontSize:22, fontWeight:800, color:'#fff', fontFamily:'DM Mono, monospace' }}>{mediaEstrellas}</span>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>{resenas.length} reseñas verificadas</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'28px 16px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Botón reservar */}
        <button onClick={() => navigate(`/reservar/${slug}`)}
          style={{ width:'100%', padding:'16px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:12, fontSize:16, fontWeight:700, cursor:'pointer' }}>
          📅 Reservar cita ahora
        </button>

        {/* Servicios */}
        {servicios.length > 0 && (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', fontSize:15, fontWeight:700, color:'#0B1E16' }}>
              Servicios
            </div>
            <div style={{ padding:'8px 16px' }}>
              {servicios.map((s, i) => (
                <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 4px', borderBottom: i<servicios.length-1 ? '1px solid #EAF5EF' : 'none' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#0B1E16' }}>{s.nombre}</div>
                    <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>{s.duracion} min</div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>
                    {s.precio_a_consultar ? 'A consultar' : s.precio ? `${s.precio} EUR` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reseñas */}
        {resenas.length > 0 && (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>Reseñas verificadas</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:18 }}>⭐</span>
                <span style={{ fontSize:18, fontWeight:800, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{mediaEstrellas}</span>
                <span style={{ fontSize:12, color:'#6B9080' }}>({resenas.length})</span>
              </div>
            </div>

            {/* Distribución */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF' }}>
              {distribucion.map(d => (
                <div key={d.n} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:12, color:'#6B9080', width:12, textAlign:'right' }}>{d.n}</span>
                  <span style={{ fontSize:12 }}>⭐</span>
                  <div style={{ flex:1, height:6, background:'#EAF5EF', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${d.pct}%`, background:'#F59E0B', borderRadius:3 }}/>
                  </div>
                  <span style={{ fontSize:12, color:'#6B9080', width:20, textAlign:'right' }}>{d.count}</span>
                </div>
              ))}
            </div>

            {/* Lista reseñas */}
            <div style={{ padding:'8px 16px' }}>
              {resenas.map((r, i) => (
                <div key={r.id} style={{ padding:'16px 4px', borderBottom: i<resenas.length-1 ? '1px solid #EAF5EF' : 'none' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'#063D2A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
                        {r.clientes?.nombre?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>
                        {r.clientes?.nombre || 'Cliente verificado'}
                      </span>
                    </div>
                    <div style={{ display:'flex', gap:2 }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} style={{ fontSize:14, color: j < r.puntuacion ? '#F59E0B' : '#D6EDE5' }}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comentario && (
                    <p style={{ fontSize:13.5, color:'#6B9080', lineHeight:1.6, margin:'0 0 8px 40px' }}>{r.comentario}</p>
                  )}
                  {r.respuesta && (
                    <div style={{ marginLeft:40, background:'#F4FAF7', borderRadius:8, padding:'10px 14px', borderLeft:'3px solid #0A9E6E' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#0A9E6E', marginBottom:4 }}>Respuesta de {negocio.nombre}</div>
                      <p style={{ fontSize:13, color:'#6B9080', margin:0, lineHeight:1.6 }}>{r.respuesta}</p>
                    </div>
                  )}
                  <div style={{ fontSize:11, color:'#A8C4B8', marginTop:6, marginLeft:40 }}>
                    {new Date(r.created_at).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resenas.length === 0 && (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'32px', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>⭐</div>
            <div style={{ fontSize:14, fontWeight:600, color:'#0B1E16', marginBottom:4 }}>Sin reseñas aún</div>
            <div style={{ fontSize:13, color:'#6B9080' }}>Sé el primero en dejar una reseña tras tu visita.</div>
          </div>
        )}

        <div style={{ textAlign:'center', fontSize:12, color:'#A8C4B8' }}>
          Perfil verificado por <strong style={{ color:'#0A9E6E' }}>Reservly</strong>
        </div>
      </div>
    </div>
  );
}