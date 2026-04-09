import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';

const TIPO_STYLES = {
  entrada: { bg:'#E8F7F2', color:'#063D2A', label:'Entrada', signo:'+' },
  salida:  { bg:'#FEF2F2', color:'#EF4444', label:'Salida',  signo:'-' },
  ajuste:  { bg:'#FFF8E7', color:'#92400E', label:'Ajuste',  signo:'~' },
};

export default function HistorialStock() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { negocio } = useNegocio();
  const isMobile = useIsMobile();
  const [producto, setProducto] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!negocio || !id) return;
    fetchData();
  }, [negocio, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    const [prodRes, movRes] = await Promise.all([
      supabase.from('productos').select('*').eq('id', id).single(),
      supabase.from('stock_movimientos').select('*')
        .eq('producto_id', id).order('created_at', { ascending: false }),
    ]);
    if (prodRes.data) setProducto(prodRes.data);
    if (movRes.data) setMovimientos(movRes.data);
    setLoading(false);
  };

  const pad = isMobile ? 16 : 32;

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  if (!producto) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Producto no encontrado</div>
    </div>
  );

  const totalEntradas = movimientos.filter(m=>m.tipo==='entrada').reduce((a,m)=>a+m.cantidad,0);
  const totalSalidas  = movimientos.filter(m=>m.tipo==='salida').reduce((a,m)=>a+m.cantidad,0);

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => navigate('/stock')}
          style={{ background:'transparent', border:'1px solid #D6EDE5', color:'#6B9080', padding:'6px 12px', borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
          ← Stock
        </button>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {producto.nombre}
        </div>
      </div>

      <div style={{ padding:pad, display:'flex', flexDirection:'column', gap:16 }}>

        {/* Info producto */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
          {[
            { label:'Stock actual',  value: producto.stock_actual,                                        featured: true },
            { label:'Stock mínimo',  value: producto.stock_minimo },
            { label:'Total entradas',value: totalEntradas },
            { label:'Total salidas', value: totalSalidas },
          ].map(s => (
            <div key={s.label} style={{ background: s.featured ? '#063D2A' : '#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color: s.featured ? '#ffffff60' : '#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:24, fontWeight:700, color: s.featured ? '#fff' : '#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Historial */}
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid #EAF5EF', fontSize:14, fontWeight:700, color:'#0B1E16' }}>
            Historial de movimientos
          </div>

          {movimientos.length > 0 ? (
            isMobile ? (
              <div style={{ display:'flex', flexDirection:'column' }}>
                {movimientos.map((m, i) => {
                  const t = TIPO_STYLES[m.tipo] || TIPO_STYLES.ajuste;
                  return (
                    <div key={m.id} style={{ padding:'12px 16px', borderBottom: i<movimientos.length-1?'1px solid #EAF5EF':'none', display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:t.color, flexShrink:0 }}>
                        {t.signo}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:t.color }}>{t.signo}{m.cantidad} unidades</span>
                          <span style={{ fontSize:11, fontFamily:'DM Mono, monospace', color:'#A8C4B8' }}>
                            {new Date(m.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div style={{ fontSize:12, color:'#6B9080' }}>{m.motivo || '—'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
                  {['Tipo','Cantidad','Motivo','Fecha'].map(h => (
                    <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
                  ))}
                </div>
                {movimientos.map((m, i) => {
                  const t = TIPO_STYLES[m.tipo] || TIPO_STYLES.ajuste;
                  return (
                    <div key={m.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', padding:'14px 20px', borderBottom: i<movimientos.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#F4FAF7'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <div>
                        <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:t.bg, color:t.color }}>{t.label}</span>
                      </div>
                      <div style={{ fontSize:14, fontWeight:700, fontFamily:'DM Mono, monospace', color:t.color }}>
                        {t.signo}{m.cantidad}
                      </div>
                      <div style={{ fontSize:13, color:'#6B9080' }}>{m.motivo || '—'}</div>
                      <div style={{ fontSize:12, fontFamily:'DM Mono, monospace', color:'#A8C4B8' }}>
                        {new Date(m.created_at).toLocaleDateString('es-ES')} {new Date(m.created_at).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </>
            )
          ) : (
            <div style={{ padding:'40px', textAlign:'center', color:'#A8C4B8' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📦</div>
              <div style={{ fontSize:14 }}>Sin movimientos registrados aún</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}