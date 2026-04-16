import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';
import PlanGate from '../../components/PlanGate';
import { usePlan } from '../../hooks/usePlan';

const Estrellas = ({ valor, max = 5, size = 14 }) => (
  <div style={{ display:'flex', gap:2 }}>
    {Array.from({ length: max }, (_, i) => (
      <span key={i} style={{ fontSize:size, color: i < valor ? '#F59E0B' : '#D6EDE5' }}>★</span>
    ))}
  </div>
);

const BarraDistribucion = ({ estrellas, total, count }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
    <div style={{ fontSize:12, color:'#6B9080', width:12, textAlign:'right' }}>{estrellas}</div>
    <span style={{ fontSize:12, color:'#F59E0B' }}>★</span>
    <div style={{ flex:1, background:'#EAF5EF', borderRadius:4, height:8, overflow:'hidden' }}>
      <div style={{ width: total > 0 ? `${(count/total)*100}%` : '0%', height:'100%', background:'#F59E0B', borderRadius:4, transition:'width 0.5s ease' }}/>
    </div>
    <div style={{ fontSize:12, fontFamily:'DM Mono, monospace', color:'#6B9080', width:20, textAlign:'right' }}>{count}</div>
  </div>
);

export default function Valoraciones() {
  const { negocio } = useNegocio();
  const isMobile = useIsMobile();
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [respondiendo, setRespondiendo] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [guardando, setGuardando] = useState(false);

  const { puede } = usePlan();

  useEffect(() => {
    if (!negocio) return;
    fetchResenas();
  }, [negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchResenas = async () => {
    const { data } = await supabase
      .from('resenas')
      .select('*, clientes(nombre), reservas(fecha, servicios(nombre))')
      .eq('negocio_id', negocio.id)
      .order('created_at', { ascending: false });
    if (data) setResenas(data);
    setLoading(false);
  };

  const guardarRespuesta = async (id) => {
    if (!respuesta.trim()) return;
    setGuardando(true);
    await supabase.from('resenas').update({
      respuesta:        respuesta.trim(),
      respuesta_fecha:  new Date().toISOString(),
    }).eq('id', id);
    setRespondiendo(null);
    setRespuesta('');
    fetchResenas();
    setGuardando(false);
  };

  const filtradas = resenas.filter(v => {
    if (filtro === 'todas')         return true;
    if (filtro === '5')             return v.puntuacion === 5;
    if (filtro === '4')             return v.puntuacion === 4;
    if (filtro === 'bajas')         return v.puntuacion <= 3;
    if (filtro === 'sin_respuesta') return !v.respuesta;
    return true;
  });

  const total        = resenas.length;
  const media        = total > 0 ? resenas.reduce((a, v) => a + (v.puntuacion || 0), 0) / total : 0;
  const cincoEst     = resenas.filter(v => v.puntuacion === 5).length;
  const sinRespuesta = resenas.filter(v => !v.respuesta && v.comentario).length;
  const pad          = isMobile ? 16 : 32;

  const distribucion = [5,4,3,2,1].map(n => ({
    estrellas: n,
    count: resenas.filter(v => v.puntuacion === n).length,
  }));

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  if (!puede('resenas')) return <PlanGate feature="resenas" planRequerido="pro" />;

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Valoraciones</div>
        {sinRespuesta > 0 && (
          <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:20, padding:'3px 10px', fontSize:12, color:'#92400E', fontWeight:600 }}>
            {sinRespuesta} sin responder
          </div>
        )}
      </div>

      <div style={{ padding:pad, display:'flex', flexDirection:'column', gap:16 }}>

        {/* Stats + distribución */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16 }}>

          <div style={{ background:'#063D2A', borderRadius:14, padding:'24px 20px', display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div>
                <div style={{ fontSize:48, fontWeight:800, color:'#fff', fontFamily:'DM Mono, monospace', lineHeight:1 }}>
                  {total > 0 ? media.toFixed(1) : '—'}
                </div>
                <Estrellas valor={Math.round(media)} size={18}/>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:4 }}>{total} valoraciones</div>
              </div>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                {distribucion.map(d => (
                  <BarraDistribucion key={d.estrellas} estrellas={d.estrellas} total={total} count={d.count}/>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 14px' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', fontWeight:600, marginBottom:4 }}>5 estrellas</div>
                <div style={{ fontSize:20, fontWeight:700, color:'#F59E0B', fontFamily:'DM Mono, monospace' }}>{cincoEst}</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 14px' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', fontWeight:600, marginBottom:4 }}>% excelentes</div>
                <div style={{ fontSize:20, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>
                  {total > 0 ? Math.round(cincoEst/total*100) : 0}%
                </div>
              </div>
            </div>
          </div>

          <div style={{ background:'#F4FAF7', border:'1px solid #EAF5EF', borderRadius:14, padding:'20px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16', marginBottom:12 }}>Cómo conseguir más valoraciones</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { emoji:'💬', texto:'Usa el botón WhatsApp del TPV tras cada cobro para pedir reseña al instante' },
                { emoji:'🔗', texto:'Copia el link de reseña desde Reservas y envíalo por cualquier canal' },
                { emoji:'⭐', texto:'Responde a todas las valoraciones — genera confianza en nuevos clientes' },
                { emoji:'🎯', texto:'Una media de 4.5+ estrellas incrementa las reservas un 30%' },
              ].map((t, i) => (
                <div key={i} style={{ display:'flex', gap:10, padding:'8px 10px', background:'#fff', borderRadius:8, border:'1px solid #EAF5EF' }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{t.emoji}</span>
                  <span style={{ fontSize:12.5, color:'#6B9080', lineHeight:1.5 }}>{t.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[
            { k:'todas',         label:'Todas' },
            { k:'5',             label:'★★★★★' },
            { k:'4',             label:'★★★★' },
            { k:'bajas',         label:'≤ 3 ★' },
            { k:'sin_respuesta', label:`Sin responder${sinRespuesta > 0 ? ` (${sinRespuesta})` : ''}` },
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

        {/* Lista */}
        {resenas.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtradas.map(v => (
              <div key={v.id} style={{ background:'#fff', border:`1px solid ${v.puntuacion >= 4 ? '#EAF5EF' : v.puntuacion === 3 ? '#F5E4A0' : '#FECACA'}`, borderRadius:12, padding: isMobile ? 14 : 18 }}>

                {/* Cabecera */}
                <div style={{ display:'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent:'space-between', marginBottom:10, flexDirection: isMobile ? 'column' : 'row', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background: v.puntuacion >= 4 ? '#E8F7F2' : '#FFF8E7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color: v.puntuacion >= 4 ? '#0A9E6E' : '#F59E0B', flexShrink:0 }}>
                      {(v.clientes?.nombre || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>{v.clientes?.nombre || 'Cliente anónimo'}</div>
                      <div style={{ fontSize:12, color:'#6B9080', marginTop:1 }}>
                        {v.reservas?.servicios?.nombre && `${v.reservas.servicios.nombre} · `}
                        {v.reservas?.fecha || new Date(v.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems: isMobile ? 'flex-start' : 'flex-end', gap:4 }}>
                    <Estrellas valor={v.puntuacion || 0} size={16}/>
                    <div style={{ fontSize:11, color:'#A8C4B8' }}>
                      {new Date(v.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>

                {/* Comentario */}
                {v.comentario && (
                  <div style={{ fontSize:13.5, color:'#0B1E16', fontStyle:'italic', lineHeight:1.6, padding:'12px 14px', background:'#F4FAF7', borderRadius:8, marginBottom:10, borderLeft:'3px solid #0A9E6E' }}>
                    "{v.comentario}"
                  </div>
                )}

                {/* Respuesta del negocio */}
                {v.respuesta && (
                  <div style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:8, padding:'10px 14px', marginBottom:8 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#063D2A', marginBottom:4 }}>
                      Tu respuesta · {v.respuesta_fecha ? new Date(v.respuesta_fecha).toLocaleDateString('es-ES') : ''}
                    </div>
                    <div style={{ fontSize:13, color:'#0B1E16', lineHeight:1.5 }}>{v.respuesta}</div>
                    <button onClick={() => { setRespondiendo(v.id); setRespuesta(v.respuesta); }}
                      style={{ marginTop:6, padding:'4px 10px', background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>
                      Editar respuesta
                    </button>
                  </div>
                )}

                {/* Botón responder / formulario */}
                {v.comentario && (
                  respondiendo === v.id ? (
                    <div style={{ marginTop:8 }}>
                      <textarea value={respuesta} onChange={e => setRespuesta(e.target.value)}
                        placeholder="Escribe tu respuesta al cliente..."
                        style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #0A9E6E', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', minHeight:80, resize:'vertical', marginBottom:8 }}/>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => guardarRespuesta(v.id)} disabled={guardando || !respuesta.trim()}
                          style={{ padding:'7px 16px', background: respuesta.trim() ? '#0A9E6E' : '#A8C4B8', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: respuesta.trim() ? 'pointer' : 'not-allowed' }}>
                          {guardando ? 'Guardando...' : 'Publicar respuesta'}
                        </button>
                        <button onClick={() => { setRespondiendo(null); setRespuesta(''); }}
                          style={{ padding:'7px 14px', background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    !v.respuesta && (
                      <button onClick={() => { setRespondiendo(v.id); setRespuesta(''); }}
                        style={{ marginTop:4, padding:'6px 12px', background:'transparent', color:'#0A9E6E', border:'1px solid #D6EDE5', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        Responder →
                      </button>
                    )
                  )
                )}
              </div>
            ))}
            {filtradas.length === 0 && (
              <div style={{ padding:40, textAlign:'center', color:'#A8C4B8', fontSize:14 }}>
                No hay valoraciones con este filtro
              </div>
            )}
          </div>
        ) : (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'60px 40px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⭐</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Sin valoraciones aún</div>
            <div style={{ fontSize:13, color:'#6B9080' }}>Usa el botón WhatsApp del TPV tras cada cobro para pedir reseñas</div>
          </div>
        )}
      </div>
    </div>
  );
}