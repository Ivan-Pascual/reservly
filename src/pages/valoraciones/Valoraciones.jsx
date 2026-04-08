import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';

const ESTRELLAS = [1, 2, 3, 4, 5];

const Estrella = ({ llena }) => (
  <span style={{ color: llena ? '#F59E0B' : '#E2E8F0', fontSize: 16 }}>★</span>
);

const MediaEstrellas = ({ valor }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {ESTRELLAS.map(e => <Estrella key={e} llena={e <= Math.round(valor || 0)} />)}
  </div>
);

const BarraCategoria = ({ label, valor, total }) => {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  const media = valor > 0 ? (valor / total * 5).toFixed(1) : '—';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: '#0B1E16', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: 'DM Mono, monospace', fontWeight: 700, color: '#F59E0B' }}>{media} ★</span>
      </div>
      <div style={{ height: 6, background: '#EAF5EF', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
};

export default function Valoraciones() {
  const { negocio } = useNegocio();
  const [valoraciones, setValoraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    if (!negocio) return;
    fetchData();
  }, [negocio]);

  const fetchData = async () => {
    const { data } = await supabase
      .from('valoraciones')
      .select(`
        *,
        clientes(nombre),
        reservas(fecha, servicios(nombre), empleados(nombre, color))
      `)
      .eq('negocio_id', negocio.id)
      .order('created_at', { ascending: false });

    if (data) setValoraciones(data);
    setLoading(false);
  };

  const filtradas = valoraciones.filter(v => {
    if (filtro === 'todas') return true;
    if (filtro === '5') return v.estrellas === 5;
    if (filtro === '4') return v.estrellas === 4;
    if (filtro === '-3') return v.estrellas <= 3;
    return true;
  });

  // Calcular medias
  const total = valoraciones.length;
  const mediaGeneral = total > 0
    ? (valoraciones.reduce((a, v) => a + (v.estrellas || 0), 0) / total).toFixed(1)
    : 0;
  const mediaResultado   = total > 0 ? valoraciones.reduce((a, v) => a + (v.resultado || 0), 0) / total : 0;
  const mediaTrato       = total > 0 ? valoraciones.reduce((a, v) => a + (v.trato || 0), 0) / total : 0;
  const mediaLimpieza    = total > 0 ? valoraciones.reduce((a, v) => a + (v.limpieza || 0), 0) / total : 0;
  const mediaPuntualidad = total > 0 ? valoraciones.reduce((a, v) => a + (v.puntualidad || 0), 0) / total : 0;

  // Distribución de estrellas
  const distrib = [5, 4, 3, 2, 1].map(n => ({
    estrellas: n,
    count: valoraciones.filter(v => v.estrellas === n).length,
    pct: total > 0 ? Math.round((valoraciones.filter(v => v.estrellas === n).length / total) * 100) : 0,
  }));

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: '#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

      <div style={{ background: '#fff', borderBottom: '1px solid #EAF5EF', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0B1E16' }}>Valoraciones</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', background: '#fff', border: '1px solid #D6EDE5', borderRadius: 8, overflow: 'hidden' }}>
            {[
              { id: 'todas', label: 'Todas' },
              { id: '5',     label: '5 ★'   },
              { id: '4',     label: '4 ★'   },
              { id: '-3',    label: '≤ 3 ★' },
            ].map(f => (
              <button key={f.id} onClick={() => setFiltro(f.id)} style={{
                padding: '7px 14px', fontSize: 12.5, fontWeight: 500,
                color: filtro === f.id ? '#fff' : '#6B9080',
                background: filtro === f.id ? '#0A9E6E' : 'transparent',
                border: 'none', borderRight: '1px solid #D6EDE5', cursor: 'pointer',
              }}>{f.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {total > 0 ? (
          <>
            {/* Stats principales */}
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>

              {/* Media general */}
              <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 14, padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 56, fontWeight: 700, color: '#0B1E16', fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>{mediaGeneral}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 3, margin: '10px 0' }}>
                  {ESTRELLAS.map(e => <Estrella key={e} llena={e <= Math.round(parseFloat(mediaGeneral))} />)}
                </div>
                <div style={{ fontSize: 13, color: '#6B9080' }}>{total} valoraciones</div>
              </div>

              {/* Distribución */}
              <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 14, padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0B1E16', marginBottom: 14 }}>Distribución</div>
                {distrib.map(d => (
                  <div key={d.estrellas} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#6B9080', width: 20, textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{d.estrellas}</span>
                    <span style={{ color: '#F59E0B', fontSize: 13 }}>★</span>
                    <div style={{ flex: 1, height: 8, background: '#EAF5EF', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${d.pct}%`, height: '100%', background: '#F59E0B', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#6B9080', width: 28, textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categorías */}
            <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0B1E16', marginBottom: 16 }}>Puntuación por categoría</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 32px' }}>
                <BarraCategoria label="✂️ Resultado"   valor={valoraciones.reduce((a, v) => a + (v.resultado || 0), 0)}   total={total} />
                <BarraCategoria label="😊 Trato"       valor={valoraciones.reduce((a, v) => a + (v.trato || 0), 0)}       total={total} />
                <BarraCategoria label="🧹 Limpieza"    valor={valoraciones.reduce((a, v) => a + (v.limpieza || 0), 0)}    total={total} />
                <BarraCategoria label="⏱️ Puntualidad" valor={valoraciones.reduce((a, v) => a + (v.puntualidad || 0), 0)} total={total} />
              </div>
            </div>

            {/* Lista valoraciones */}
            <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAF5EF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1E16' }}>Valoraciones recientes</div>
                <div style={{ fontSize: 12, color: '#6B9080' }}>{filtradas.length} mostradas</div>
              </div>

              {filtradas.length > 0 ? filtradas.map((v, i) => (
                <div key={v.id} style={{ padding: '16px 20px', borderBottom: i < filtradas.length - 1 ? '1px solid #EAF5EF' : 'none', display: 'flex', gap: 14, alignItems: 'flex-start' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F4FAF7'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Avatar */}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0A9E6E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {(v.clientes?.nombre || '?')[0].toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0B1E16' }}>{v.clientes?.nombre || 'Cliente'}</span>
                        <MediaEstrellas valor={v.estrellas} />
                      </div>
                      <span style={{ fontSize: 11, color: '#A8C4B8', fontFamily: 'DM Mono, monospace' }}>
                        {new Date(v.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    {/* Info reserva */}
                    {v.reservas && (
                      <div style={{ fontSize: 11.5, color: '#6B9080', marginBottom: 6, display: 'flex', gap: 8 }}>
                        <span>{v.reservas.fecha}</span>
                        {v.reservas.servicios && <span>· {v.reservas.servicios.nombre}</span>}
                        {v.reservas.empleados && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            · <div style={{ width: 6, height: 6, borderRadius: '50%', background: v.reservas.empleados.color || '#ccc' }} />
                            {v.reservas.empleados.nombre}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Comentario */}
                    {v.comentario && (
                      <div style={{ fontSize: 13, color: '#334155', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 8 }}>
                        "{v.comentario}"
                      </div>
                    )}

                    {/* Categorías detalle */}
                    {(v.resultado || v.trato || v.limpieza || v.puntualidad) && (
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {[
                          { label: '✂️ Resultado',   val: v.resultado   },
                          { label: '😊 Trato',       val: v.trato       },
                          { label: '🧹 Limpieza',    val: v.limpieza    },
                          { label: '⏱️ Puntualidad', val: v.puntualidad },
                        ].filter(c => c.val).map(c => (
                          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F4FAF7', padding: '3px 8px', borderRadius: 20, fontSize: 11.5 }}>
                            <span style={{ color: '#6B9080' }}>{c.label}</span>
                            <span style={{ color: '#F59E0B', fontWeight: 700 }}>{c.val}★</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#A8C4B8', fontSize: 14 }}>
                  No hay valoraciones con este filtro
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 14, padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0B1E16', marginBottom: 6 }}>Sin valoraciones aún</div>
            <div style={{ fontSize: 13, color: '#6B9080', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
              Las valoraciones aparecerán aquí cuando los clientes respondan al WhatsApp automático tras su cita
            </div>
            <div style={{ background: '#E8F7F2', border: '1px solid #D6EDE5', borderRadius: 10, padding: '12px 20px', display: 'inline-block', fontSize: 13, color: '#063D2A' }}>
              💡 Activa las valoraciones en <strong>Ajustes → Notificaciones</strong>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}