import React, { useState, useEffect } from 'react';
import { useNegocio } from '../../hooks/useNegocio';
import { supabase } from '../../supabase';
import { useIsMobile } from '../../hooks/useIsMobile';

const HORAS = Array.from({ length: 20 }, (_, i) => {
  const h = Math.floor(i / 2) + 9;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2,'0')}:${m}`;
});

const DIAS_SEMANA = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

const ESTADO_COLORS = {
  confirmada: '#0A9E6E',
  pendiente:  '#F59E0B',
  completada: '#A8C4B8',
  cancelada:  '#EF4444',
};

export default function Agenda() {
  const { negocio } = useNegocio();
  const isMobile = useIsMobile();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [diaSeleccionado, setDiaSeleccionado] = useState(0); // para móvil

  const getLunes = (offset = 0) => {
    const hoy = new Date();
    const dia = hoy.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diff + offset * 7);
    lunes.setHours(0,0,0,0);
    return lunes;
  };

  const lunes = getLunes(semanaOffset);
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });

  const fechaStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  useEffect(() => {
    if (!negocio) return;
    fetchData();
  }, [negocio, semanaOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    const inicio = fechaStr(diasSemana[0]);
    const fin    = fechaStr(diasSemana[6]);

    const { data } = await supabase
      .from('reservas').select(`
        *, clientes(nombre), empleados(nombre, color), servicios(nombre)
      `).eq('negocio_id', negocio.id)
        .gte('fecha', inicio).lte('fecha', fin)
        .not('estado', 'eq', 'cancelada');

    if (data) setReservas(data);
    setLoading(false);
  };

  const getReservasDia = (fecha) =>
    reservas.filter(r => r.fecha === fechaStr(fecha));

  const getReservasHora = (fecha, hora) => {
    return getReservasDia(fecha).filter(r => {
      const ini = r.hora_inicio?.slice(0,5);
      const fin = r.hora_fin?.slice(0,5);
      return ini <= hora && hora < fin;
    });
  };

  const horaAMinutos = (hora) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };

  const esHoy = (fecha) => fechaStr(fecha) === fechaStr(new Date());

  const tituloSemana = () => {
    const ini = diasSemana[0];
    const fin = diasSemana[6];
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    if (ini.getMonth() === fin.getMonth()) {
      return `${ini.getDate()}–${fin.getDate()} ${meses[ini.getMonth()]} ${ini.getFullYear()}`;
    }
    return `${ini.getDate()} ${meses[ini.getMonth()]} – ${fin.getDate()} ${meses[fin.getMonth()]} ${fin.getFullYear()}`;
  };

  const pad = isMobile ? 0 : 0;

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando agenda...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 16px', height:60, display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Agenda</div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:12 }}>
          <button onClick={() => setSemanaOffset(s=>s-1)}
            style={{ width:28, height:28, border:'1px solid #D6EDE5', borderRadius:8, background:'transparent', cursor:'pointer', color:'#6B9080', fontSize:14 }}>‹</button>
          <div style={{ fontSize: isMobile ? 12 : 13.5, fontWeight:600, color:'#0B1E16', minWidth: isMobile ? 120 : 200, textAlign:'center' }}>
            {tituloSemana()}
          </div>
          <button onClick={() => setSemanaOffset(s=>s+1)}
            style={{ width:28, height:28, border:'1px solid #D6EDE5', borderRadius:8, background:'transparent', cursor:'pointer', color:'#6B9080', fontSize:14 }}>›</button>
        </div>
        <button onClick={() => { setSemanaOffset(0); setDiaSeleccionado(0); }}
          style={{ padding:'4px 10px', border:'1px solid #D6EDE5', borderRadius:8, background: semanaOffset===0 ? '#E8F7F2' : 'transparent', color: semanaOffset===0 ? '#0A9E6E' : '#6B9080', fontSize:12, fontWeight:600, cursor:'pointer' }}>
          Hoy
        </button>

        {!isMobile && (
          <div style={{ marginLeft:'auto', display:'flex', gap:12 }}>
            {[
              { label:'Confirmada', color:'#0A9E6E' },
              { label:'Pendiente',  color:'#F59E0B' },
              { label:'Completada', color:'#A8C4B8' },
            ].map(l => (
              <div key={l.label} style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#6B9080' }}>
                <div style={{ width:8, height:8, borderRadius:2, background:l.color }}/>
                {l.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vista móvil */}
      {isMobile ? (
        <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

          {/* Selector de días */}
          <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', display:'flex', overflowX:'auto' }}>
            {diasSemana.map((d, i) => (
              <div key={i} onClick={() => setDiaSeleccionado(i)}
                style={{ flex:'0 0 auto', padding:'10px 14px', textAlign:'center', cursor:'pointer', borderBottom: diaSeleccionado===i ? '2.5px solid #0A9E6E' : '2.5px solid transparent',
                  background: esHoy(d) && diaSeleccionado===i ? '#E8F7F2' : 'transparent' }}>
                <div style={{ fontSize:10, fontWeight:600, color: diaSeleccionado===i ? '#0A9E6E' : '#A8C4B8', textTransform:'uppercase' }}>{DIAS_SEMANA[i]}</div>
                <div style={{ fontSize:18, fontWeight:700, color: esHoy(d) ? '#0A9E6E' : diaSeleccionado===i ? '#0B1E16' : '#6B9080', marginTop:2 }}>{d.getDate()}</div>
                {getReservasDia(d).length > 0 && (
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#0A9E6E', margin:'3px auto 0' }}/>
                )}
              </div>
            ))}
          </div>

          {/* Agenda del día seleccionado en móvil */}
          <div style={{ flex:1, overflowY:'auto', padding:16 }}>
            {(() => {
              const diaActual = diasSemana[diaSeleccionado];
              const reservasDia = getReservasDia(diaActual).sort((a,b) =>
                (a.hora_inicio||'').localeCompare(b.hora_inicio||'')
              );
              if (reservasDia.length === 0) return (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#A8C4B8' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>📅</div>
                  <div style={{ fontSize:14 }}>No hay citas este día</div>
                </div>
              );
              return (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {reservasDia.map(r => (
                    <div key={r.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:14, borderLeft:`4px solid ${ESTADO_COLORS[r.estado]||'#0A9E6E'}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>{r.clientes?.nombre || 'Cliente'}</div>
                        <div style={{ fontSize:12, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>
                          {r.hora_inicio?.slice(0,5)} – {r.hora_fin?.slice(0,5)}
                        </div>
                      </div>
                      <div style={{ fontSize:12.5, color:'#6B9080', marginBottom:4 }}>{r.servicios?.nombre || '—'}</div>
                      {r.empleados && (
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <div style={{ width:7, height:7, borderRadius:'50%', background:r.empleados.color||'#ccc' }}/>
                          <span style={{ fontSize:12, color:'#6B9080' }}>{r.empleados.nombre}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

        </div>
      ) : (
        /* Vista desktop — grid semanal */
        <div style={{ flex:1, overflowY:'auto', overflowX:'auto' }}>
          <div style={{ minWidth:700 }}>

            {/* Header días */}
            <div style={{ display:'grid', gridTemplateColumns:'60px repeat(7, 1fr)', borderBottom:'1px solid #EAF5EF', background:'#fff', position:'sticky', top:0, zIndex:10 }}>
              <div style={{ borderRight:'1px solid #EAF5EF' }}/>
              {diasSemana.map((d, i) => (
                <div key={i} style={{
                  padding:'10px 8px', textAlign:'center',
                  borderRight: i < 6 ? '1px solid #EAF5EF' : 'none',
                  background: esHoy(d) ? '#E8F7F2' : 'transparent',
                }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase' }}>{DIAS_SEMANA[i]}</div>
                  <div style={{ fontSize:20, fontWeight:700, color: esHoy(d) ? '#0A9E6E' : '#0B1E16', marginTop:2 }}>{d.getDate()}</div>
                  <div style={{ fontSize:11, color:'#A8C4B8', marginTop:1 }}>
                    {getReservasDia(d).length > 0 ? `${getReservasDia(d).length} citas` : ''}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid horas */}
            {HORAS.map((hora) => (
              <div key={hora} style={{ display:'grid', gridTemplateColumns:'60px repeat(7, 1fr)', borderBottom:'1px solid #EAF5EF', minHeight:52 }}>
                <div style={{ padding:'4px 8px', borderRight:'1px solid #EAF5EF', fontSize:11, color:'#A8C4B8', fontFamily:'DM Mono, monospace', paddingTop:6 }}>
                  {hora}
                </div>
                {diasSemana.map((d, di) => {
                  const reservasSlot = getReservasHora(d, hora);
                  return (
                    <div key={di} style={{
                      borderRight: di < 6 ? '1px solid #EAF5EF' : 'none',
                      background: esHoy(d) ? '#F4FAF7' : 'transparent',
                      padding: reservasSlot.length > 0 ? 3 : 0,
                      display:'flex', flexDirection:'column', gap:2,
                    }}>
                      {reservasSlot.map(r => {
                        const duracion = r.servicios
                          ? (horaAMinutos(r.hora_fin?.slice(0,5)||'00:00') - horaAMinutos(r.hora_inicio?.slice(0,5)||'00:00'))
                          : 30;
                        const esInicioSlot = r.hora_inicio?.slice(0,5) === hora;
                        if (!esInicioSlot) return null;
                        const slots = Math.max(1, duracion / 30);
                        return (
                          <div key={r.id} style={{
                            background: (ESTADO_COLORS[r.estado] || '#0A9E6E') + '20',
                            borderLeft: `3px solid ${ESTADO_COLORS[r.estado] || '#0A9E6E'}`,
                            borderRadius:'0 6px 6px 0',
                            padding:'4px 6px',
                            minHeight: slots * 52 - 8,
                            overflow:'hidden',
                          }}>
                            <div style={{ fontSize:11.5, fontWeight:700, color:'#0B1E16', lineHeight:1.3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {r.clientes?.nombre || 'Cliente'}
                            </div>
                            <div style={{ fontSize:10.5, color:'#6B9080', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {r.servicios?.nombre || ''}
                            </div>
                            {r.empleados && (
                              <div style={{ display:'flex', alignItems:'center', gap:3, marginTop:3 }}>
                                <div style={{ width:5, height:5, borderRadius:'50%', background:r.empleados.color||'#ccc', flexShrink:0 }}/>
                                <span style={{ fontSize:10, color:'#6B9080', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.empleados.nombre}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats semana */}
      <div style={{ background:'#fff', borderTop:'1px solid #EAF5EF', padding:'10px 16px', display:'flex', gap: isMobile ? 12 : 24, flexWrap:'wrap' }}>
        {[
          { label:'Esta semana', value: reservas.length },
          { label:'Confirmadas', value: reservas.filter(r=>r.estado==='confirmada').length },
          { label:'Pendientes',  value: reservas.filter(r=>r.estado==='pendiente').length },
          { label:'Completadas', value: reservas.filter(r=>r.estado==='completada').length },
        ].map(s => (
          <div key={s.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:12, color:'#6B9080' }}>{s.label}:</span>
            <span style={{ fontSize:13, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</span>
          </div>
        ))}
      </div>

    </div>
  );
}