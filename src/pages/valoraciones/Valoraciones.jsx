import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';

const Estrellas = ({ valor, max = 5 }) => (
  <div style={{ display:'flex', gap:2 }}>
    {Array.from({ length: max }, (_, i) => (
      <span key={i} style={{ fontSize:14, color: i < valor ? '#F59E0B' : '#D6EDE5' }}>★</span>
    ))}
  </div>
);

export default function Valoraciones() {
  const { negocio } = useNegocio();
  const isMobile = useIsMobile();
  const [valoraciones, setValoraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    if (!negocio) return;
    fetchValoraciones();
  }, [negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchValoraciones = async () => {
    const { data } = await supabase
      .from('valoraciones').select('*, clientes(nombre), reservas(fecha, servicios(nombre))')
      .eq('negocio_id', negocio.id).order('created_at', { ascending: false });
    if (data) setValoraciones(data);
    setLoading(false);
  };

  const filtradas = valoraciones.filter(v => {
    if (filtro === 'todas') return true;
    if (filtro === '5') return v.estrellas === 5;
    if (filtro === '4') return v.estrellas === 4;
    if (filtro === 'bajas') return v.estrellas <= 3;
    return true;
  });

  const total = valoraciones.length;
  const media = total > 0 ? valoraciones.reduce((a, v) => a + (v.estrellas || 0), 0) / total : 0;
  const cincoEstrellas = valoraciones.filter(v => v.estrellas === 5).length;
  const pad = isMobile ? 16 : 32;

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Valoraciones</div>
      </div>

      <div style={{ padding:pad, display:'flex', flexDirection:'column', gap:16 }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
          {[
            { label:'Media general', value: total > 0 ? media.toFixed(1) + ' ★' : '—', featured: true },
            { label:'Total valoraciones', value: total },
            { label:'5 estrellas', value: cincoEstrellas },
            { label:'% excelentes', value: total > 0 ? Math.round(cincoEstrellas/total*100) + '%' : '—' },
          ].map(s => (
            <div key={s.label} style={{ background: s.featured ? '#063D2A' : '#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color: s.featured ? '#ffffff60' : '#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:700, color: s.featured ? '#F59E0B' : '#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden', width:'fit-content' }}>
          {[
            { k:'todas', label:'Todas' },
            { k:'5',     label:'★★★★★' },
            { k:'4',     label:'★★★★' },
            { k:'bajas', label:'≤ 3 ★' },
          ].map(f => (
            <button key={f.k} onClick={() => setFiltro(f.k)} style={{
              padding:'7px 14px', fontSize:12.5, fontWeight:500,
              color: filtro===f.k ? '#fff' : '#6B9080',
              background: filtro===f.k ? '#0A9E6E' : 'transparent',
              border:'none', borderRight:'1px solid #D6EDE5', cursor:'pointer',
            }}>{f.label}</button>
          ))}
        </div>

        {/* Lista */}
        {valoraciones.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtradas.map(v => (
              <div key={v.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding: isMobile ? 14 : 18 }}>
                <div style={{ display:'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent:'space-between', marginBottom:10, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:'#E8F7F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#0A9E6E', flexShrink:0 }}>
                      {(v.clientes?.nombre || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>{v.clientes?.nombre || 'Cliente anónimo'}</div>
                      <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>
                        {v.reservas?.servicios?.nombre || '—'} · {v.reservas?.fecha || ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems: isMobile ? 'flex-start' : 'flex-end', gap:4 }}>
                    <Estrellas valor={v.estrellas || 0} />
                    <div style={{ fontSize:11, color:'#A8C4B8' }}>
                      {new Date(v.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
                {v.comentario && (
                  <div style={{ fontSize:13, color:'#6B9080', fontStyle:'italic', lineHeight:1.5, padding:'10px 12px', background:'#F4FAF7', borderRadius:8 }}>
                    "{v.comentario}"
                  </div>
                )}
                {!isMobile && (v.resultado || v.trato || v.limpieza || v.puntualidad) && (
                  <div style={{ display:'flex', gap:16, marginTop:10, flexWrap:'wrap' }}>
                    {[
                      { label:'Resultado', val: v.resultado },
                      { label:'Trato',     val: v.trato },
                      { label:'Limpieza',  val: v.limpieza },
                      { label:'Puntualidad', val: v.puntualidad },
                    ].filter(d => d.val).map(d => (
                      <div key={d.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontSize:11, color:'#6B9080' }}>{d.label}</span>
                        <Estrellas valor={d.val} max={5} />
                      </div>
                    ))}
                  </div>
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
            <div style={{ fontSize:13, color:'#6B9080' }}>Las valoraciones aparecerán aquí cuando los clientes puntúen sus citas</div>
          </div>
        )}

      </div>
    </div>
  );
}