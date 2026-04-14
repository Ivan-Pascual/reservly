import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';
import { slugificar } from '../../utils/helpers';
import { generarBackup } from '../../services/backup';
import { googleCalendar } from '../../services/googleCalendar';
import { usePlan } from '../../hooks/usePlan';

const Toggle = ({ on, onChange }) => (
  <div onClick={() => onChange(!on)} style={{
    width:40, height:22, borderRadius:11,
    background: on ? '#0A9E6E' : '#D6EDE5',
    position:'relative', cursor:'pointer', transition:'background 0.2s', flexShrink:0,
  }}>
    <div style={{
      position:'absolute', width:16, height:16, borderRadius:'50%',
      background:'#fff', top:3, left: on ? 21 : 3,
      transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
    }}/>
  </div>
);

const PLANES = [
  {
    plan: 'basico',
    nombre: 'Básico',
    precio: 19,
    desc: 'Para autónomos y negocios de una persona.',
    features: ['Reservas ilimitadas','Hasta 2 empleados','TPV y stock con escáner','Google Calendar sync','Notificaciones push','PWA instalable','Backup de datos'],
  },
  {
    plan: 'pro',
    nombre: 'Pro',
    precio: 39,
    desc: 'Para negocios con equipo que quieren automatizar.',
    destacado: true,
    features: ['Todo lo del Básico','Empleados ilimitados','WhatsApp automático','Fidelización con sellos','Widget embebible','Perfil público + reseñas','Formulario de admisión','Comisiones automáticas','Bonos y descuentos','Estadísticas avanzadas'],
  },
  {
    plan: 'agencia',
    nombre: 'Agencia',
    precio: 79,
    desc: 'Para gestores que llevan varios negocios.',
    features: ['Todo lo del Pro','Multi-sede (5 locales)','Factura electrónica','Panel multi-negocio','API acceso','White label parcial','Soporte prioritario'],
  },
];

export default function Ajustes() {
  const { negocio, loading: negocioLoading } = useNegocio();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { puede, plan: planActivo, diasRestantes, esTrial } = usePlan();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generandoBackup, setGenerandoBackup] = useState(false);
  const [backupOk, setBackupOk] = useState(null);
  const [googleConectado, setGoogleConectado] = useState(false);
  const [googleCargando, setGoogleCargando] = useState(false);
  const [googleMsg, setGoogleMsg] = useState('');
  const [sincronizando, setSincronizando] = useState(false);
  const [iniciandoPago, setIniciandoPago] = useState(false);

  const [info, setInfo] = useState({
    nombre:'', telefono:'', email:'', direccion:'', slug:'',
  });

  const [cfg, setCfg] = useState({
    notif_email:true, notif_whatsapp:true,
    recordatorio:true, recordatorio_horas:2,
    valoraciones:true,
    cancelacion:true, cancelacion_horas:2,
    senal:false, senal_importe:10,
    lista_espera:true, retencion:true, retencion_semanas:4,
  });

  const [horario, setHorario] = useState({
    lunes:     { activo:true,  apertura:'09:00', cierre:'18:00' },
    martes:    { activo:true,  apertura:'09:00', cierre:'18:00' },
    miercoles: { activo:true,  apertura:'09:00', cierre:'18:00' },
    jueves:    { activo:true,  apertura:'09:00', cierre:'18:00' },
    viernes:   { activo:true,  apertura:'09:00', cierre:'18:00' },
    sabado:    { activo:false, apertura:'10:00', cierre:'14:00' },
    domingo:   { activo:false, apertura:'10:00', cierre:'14:00' },
  });

  const [tipo, setTipo] = useState('profesional');

  useEffect(() => {
    if (!negocio) return;
    fetchData();
    const token = googleCalendar.getToken();
    setGoogleConectado(!!token);
    Promise.all([googleCalendar.cargarScript(), googleCalendar.cargarGSI()]).catch(() => {});
  }, [negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setInfo({
      nombre:    negocio.nombre    || '',
      telefono:  negocio.telefono  || '',
      email:     negocio.email     || '',
      direccion: negocio.direccion || '',
      slug:      negocio.slug      || '',
    });
    setTipo(negocio.tipo || 'profesional');

    const { data: config } = await supabase
      .from('configuracion').select('*')
      .eq('negocio_id', negocio.id).single();

    if (config) {
      setCfg({
        notif_email:        config.notif_email        ?? true,
        notif_whatsapp:     config.notif_whatsapp     ?? true,
        recordatorio:       config.recordatorio       ?? true,
        recordatorio_horas: config.recordatorio_horas ?? 2,
        valoraciones:       config.valoraciones       ?? true,
        cancelacion:        config.cancelacion        ?? true,
        cancelacion_horas:  config.cancelacion_horas  ?? 2,
        senal:              config.senal              ?? false,
        senal_importe:      config.senal_importe      ?? 10,
        lista_espera:       config.lista_espera       ?? true,
        retencion:          config.retencion          ?? true,
        retencion_semanas:  config.retencion_semanas  ?? 4,
      });
      setHorario({
        lunes:     { activo: config.horario_lunes_activo     ?? true,  apertura: config.horario_lunes_apertura?.slice(0,5)     || '09:00', cierre: config.horario_lunes_cierre?.slice(0,5)     || '18:00' },
        martes:    { activo: config.horario_martes_activo    ?? true,  apertura: config.horario_martes_apertura?.slice(0,5)    || '09:00', cierre: config.horario_martes_cierre?.slice(0,5)    || '18:00' },
        miercoles: { activo: config.horario_miercoles_activo ?? true,  apertura: config.horario_miercoles_apertura?.slice(0,5) || '09:00', cierre: config.horario_miercoles_cierre?.slice(0,5) || '18:00' },
        jueves:    { activo: config.horario_jueves_activo    ?? true,  apertura: config.horario_jueves_apertura?.slice(0,5)    || '09:00', cierre: config.horario_jueves_cierre?.slice(0,5)    || '18:00' },
        viernes:   { activo: config.horario_viernes_activo   ?? true,  apertura: config.horario_viernes_apertura?.slice(0,5)   || '09:00', cierre: config.horario_viernes_cierre?.slice(0,5)   || '18:00' },
        sabado:    { activo: config.horario_sabado_activo    ?? false, apertura: config.horario_sabado_apertura?.slice(0,5)    || '10:00', cierre: config.horario_sabado_cierre?.slice(0,5)    || '14:00' },
        domingo:   { activo: config.horario_domingo_activo   ?? false, apertura: config.horario_domingo_apertura?.slice(0,5)   || '10:00', cierre: config.horario_domingo_cierre?.slice(0,5)   || '14:00' },
      });
    }
    setLoading(false);
  };

  const guardar = async () => {
    setSaving(true);
    const slugLimpio = slugificar(info.slug || info.nombre);
    await supabase.from('negocios').update({
      nombre: info.nombre, telefono: info.telefono,
      email: info.email, direccion: info.direccion,
      slug: slugLimpio, tipo,
    }).eq('id', negocio.id);
    await supabase.from('configuracion').upsert({
      negocio_id: negocio.id, ...cfg,
      horario_lunes_activo:       horario.lunes.activo,
      horario_lunes_apertura:     horario.lunes.apertura,
      horario_lunes_cierre:       horario.lunes.cierre,
      horario_martes_activo:      horario.martes.activo,
      horario_martes_apertura:    horario.martes.apertura,
      horario_martes_cierre:      horario.martes.cierre,
      horario_miercoles_activo:   horario.miercoles.activo,
      horario_miercoles_apertura: horario.miercoles.apertura,
      horario_miercoles_cierre:   horario.miercoles.cierre,
      horario_jueves_activo:      horario.jueves.activo,
      horario_jueves_apertura:    horario.jueves.apertura,
      horario_jueves_cierre:      horario.jueves.cierre,
      horario_viernes_activo:     horario.viernes.activo,
      horario_viernes_apertura:   horario.viernes.apertura,
      horario_viernes_cierre:     horario.viernes.cierre,
      horario_sabado_activo:      horario.sabado.activo,
      horario_sabado_apertura:    horario.sabado.apertura,
      horario_sabado_cierre:      horario.sabado.cierre,
      horario_domingo_activo:     horario.domingo.activo,
      horario_domingo_apertura:   horario.domingo.apertura,
      horario_domingo_cierre:     horario.domingo.cierre,
    });
    setInfo(p => ({ ...p, slug: slugLimpio }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const iniciarPago = async (plan = 'basico') => {
    setIniciandoPago(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negocioId:     negocio.id,
          email:         negocio.email || '',
          nombreNegocio: negocio.nombre || '',
          plan,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Error al iniciar el pago. Inténtalo de nuevo.');
    } catch (err) {
      console.error('Stripe error:', err);
      alert('Error al conectar con el sistema de pagos.');
    }
    setIniciandoPago(false);
  };

  const set = k => v => setCfg(p => ({ ...p, [k]: v }));

  const inputStyle = {
    width:'100%', padding:'9px 12px',
    border:'1.5px solid #D6EDE5', borderRadius:8,
    fontSize:13.5, fontFamily:'DM Sans, sans-serif',
    outline:'none', background:'#F4FAF7',
  };

  const Section = ({ title, children }) => (
    <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden', marginBottom:16 }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', fontSize:14, fontWeight:700, color:'#0B1E16' }}>{title}</div>
      <div style={{ padding:'0 20px' }}>{children}</div>
    </div>
  );

  const Row = ({ title, desc, children }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid #EAF5EF', gap:16 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{title}</div>
        {desc && <div style={{ fontSize:11.5, color:'#6B9080', marginTop:2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );

  const SelectRow = ({ label, value, onChange, options }) => (
    <div style={{ padding:'12px 0', borderBottom:'1px solid #EAF5EF' }}>
      <div style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:6 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', background:'#F4FAF7' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  if (loading || negocioLoading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  const pad = isMobile ? 16 : 32;

  const planLabel = {
    trial:   `Prueba gratuita · ${diasRestantes} días restantes`,
    basico:  'Plan Básico · Activo',
    pro:     'Plan Pro · Activo',
    agencia: 'Plan Agencia · Activo',
  }[planActivo] || 'Plan Básico';

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {saved && (
        <div style={{
          position:'fixed', bottom:24, right:24, zIndex:9999,
          background:'#063D2A', color:'#fff',
          padding:'12px 20px', borderRadius:12,
          fontSize:13, fontWeight:600,
          display:'flex', alignItems:'center', gap:8,
          boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
          animation:'slideIn 0.2s ease',
        }}>
          <span style={{ fontSize:16 }}>✓</span>
          Cambios guardados correctamente
        </div>
      )}

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Ajustes</div>
        <div style={{ marginLeft:'auto' }}>
          <button onClick={guardar} disabled={saving} style={{
            background: saving ? '#A8C4B8' : '#0A9E6E', color:'#fff',
            border:'none', padding:'8px 20px', borderRadius:8,
            fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding:pad, display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:20 }}>

        {/* ── Col izquierda ── */}
        <div>
          <Section title="Información del negocio">
            {[
              { key:'nombre',    label:'Nombre del negocio' },
              { key:'slug',      label:'URL pública', prefix:'getreservly.com/reservar/', mono:true },
              { key:'telefono',  label:'Teléfono', mono:true },
              { key:'email',     label:'Email de contacto', type:'email' },
              { key:'direccion', label:'Dirección' },
            ].map(f => (
              <div key={f.key} style={{ padding:'12px 0', borderBottom:'1px solid #EAF5EF' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:5 }}>{f.label}</div>
                {f.prefix ? (
                  <div style={{ display:'flex', border:'1.5px solid #D6EDE5', borderRadius:8, overflow:'hidden' }}>
                    <span style={{ padding:'8px 10px', background:'#EAF5EF', fontSize:11, color:'#6B9080', borderRight:'1px solid #D6EDE5', whiteSpace:'nowrap' }}>{f.prefix}</span>
                    <input value={info[f.key]} onChange={e => setInfo({...info, [f.key]:e.target.value})}
                      onBlur={() => setInfo(p => ({...p, slug: slugificar(p.slug)}))}
                      style={{ flex:1, padding:'8px 10px', border:'none', outline:'none', fontSize:13, fontFamily:'DM Mono, monospace', background:'#F4FAF7', minWidth:0 }}/>
                  </div>
                ) : (
                  <input value={info[f.key]} onChange={e => setInfo({...info, [f.key]:e.target.value})}
                    type={f.type || 'text'}
                    style={{ ...inputStyle, fontFamily: f.mono ? 'DM Mono, monospace' : 'DM Sans, sans-serif' }}
                    onFocus={e => e.target.style.borderColor='#0A9E6E'}
                    onBlur={e => e.target.style.borderColor='#D6EDE5'}/>
                )}
              </div>
            ))}
            <div style={{ padding:'12px 0' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Tu perfil público</div>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ flex:1, padding:'9px 12px', background:'#F4FAF7', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:11.5, fontFamily:'DM Mono, monospace', color:'#6B9080', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  getreservly.com/negocio/{negocio?.slug || ''}
                </div>
                <button onClick={() => window.open(`https://getreservly.com/negocio/${negocio?.slug}`, '_blank')}
                  style={{ padding:'9px 14px', background:'#063D2A', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0 }}>
                  Ver →
                </button>
                <button onClick={() => { navigator.clipboard.writeText(`https://getreservly.com/negocio/${negocio?.slug}`); alert('URL copiada'); }}
                  style={{ padding:'9px 12px', background:'transparent', color:'#6B9080', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0 }}>
                  Copiar
                </button>
              </div>
            </div>
            <div style={{ height:12 }}/>
          </Section>

          <Section title="Tipo de negocio">
            <div style={{ padding:'14px 0', borderBottom:'1px solid #EAF5EF' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { v:'profesional', label:'💈 Por profesional', desc:'Cada empleado tiene su agenda' },
                  { v:'recurso',     label:'🍽️ Por recurso',     desc:'Reservas por mesa o espacio' },
                  { v:'simple',      label:'📅 Simple',           desc:'Solo el dueño gestiona' },
                ].map(o => (
                  <label key={o.v} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', border:`1.5px solid ${tipo===o.v ? '#0A9E6E' : '#D6EDE5'}`, borderRadius:8, cursor:'pointer', background: tipo===o.v ? '#E8F7F2' : '#F4FAF7' }}>
                    <input type="radio" name="tipo" checked={tipo===o.v} onChange={() => setTipo(o.v)} style={{ marginTop:2, accentColor:'#0A9E6E' }}/>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{o.label}</div>
                      <div style={{ fontSize:11.5, color:'#6B9080', marginTop:2 }}>{o.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ height:12 }}/>
          </Section>

          <Section title="Horario de apertura">
            <div style={{ padding:'8px 0' }}>
              {[
                { key:'lunes', label:'Lunes' }, { key:'martes', label:'Martes' },
                { key:'miercoles', label:'Miércoles' }, { key:'jueves', label:'Jueves' },
                { key:'viernes', label:'Viernes' }, { key:'sabado', label:'Sábado' },
                { key:'domingo', label:'Domingo' },
              ].map((dia, i, arr) => {
                const h = horario[dia.key];
                return (
                  <div key={dia.key} style={{ padding:'10px 0', borderBottom: i<arr.length-1 ? '1px solid #EAF5EF' : 'none' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 44px', gap:10, alignItems:'center', marginBottom: h.activo ? 8 : 0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color: h.activo ? '#0B1E16' : '#A8C4B8' }}>{dia.label}</div>
                      <div onClick={() => setHorario(p => ({...p, [dia.key]:{...p[dia.key], activo:!p[dia.key].activo}}))}
                        style={{ width:40, height:22, borderRadius:11, background: h.activo ? '#0A9E6E' : '#D6EDE5', position:'relative', cursor:'pointer', transition:'background 0.2s' }}>
                        <div style={{ position:'absolute', width:16, height:16, borderRadius:'50%', background:'#fff', top:3, left: h.activo ? 21 : 3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                      </div>
                    </div>
                    {h.activo ? (
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <input type="time" value={h.apertura}
                          onChange={e => setHorario(p => ({...p, [dia.key]:{...p[dia.key], apertura:e.target.value}}))}
                          style={{ flex:1, minWidth:90, padding:'5px 8px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:12.5, fontFamily:'DM Mono, monospace', outline:'none', background:'#F4FAF7' }}/>
                        <span style={{ fontSize:12, color:'#A8C4B8' }}>—</span>
                        <input type="time" value={h.cierre}
                          onChange={e => setHorario(p => ({...p, [dia.key]:{...p[dia.key], cierre:e.target.value}}))}
                          style={{ flex:1, minWidth:90, padding:'5px 8px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:12.5, fontFamily:'DM Mono, monospace', outline:'none', background:'#F4FAF7' }}/>
                      </div>
                    ) : (
                      <span style={{ fontSize:12.5, color:'#A8C4B8' }}>Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ height:4 }}/>
          </Section>

          {/* Plan y suscripción */}
          <Section title="Plan y suscripción">
            <div style={{ padding:'14px 0' }}>

              {/* Plan actual */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, padding:'12px 14px', background:'#F4FAF7', borderRadius:10, flexWrap:'wrap', gap:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16' }}>{planLabel}</div>
                  {esTrial && <div style={{ fontSize:11.5, color:'#6B9080', marginTop:2 }}>Acceso completo durante el período de prueba</div>}
                </div>
                <span style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:20, background:'#E8F7F2', color:'#063D2A' }}>● Activo</span>
              </div>

              {/* Tres planes */}
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {PLANES.map(p => (
                  <div key={p.plan} style={{
                    border: `1.5px solid ${planActivo === p.plan ? '#0A9E6E' : p.destacado ? '#0A9E6E' : '#EAF5EF'}`,
                    borderRadius:12, overflow:'hidden',
                    background: planActivo === p.plan ? '#E8F7F2' : '#fff',
                  }}>
                    <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:'#0B1E16' }}>{p.nombre}</span>
                          {p.destacado && planActivo !== p.plan && (
                            <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:20, background:'#0A9E6E', color:'#fff' }}>POPULAR</span>
                          )}
                          {planActivo === p.plan && (
                            <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:20, background:'#063D2A', color:'#fff' }}>ACTIVO</span>
                          )}
                        </div>
                        <div style={{ fontSize:11.5, color:'#6B9080', marginTop:2 }}>{p.desc}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <span style={{ fontSize:20, fontWeight:800, color:'#063D2A', fontFamily:'DM Mono, monospace' }}>{p.precio}€</span>
                        <span style={{ fontSize:11, color:'#6B9080' }}>/mes</span>
                      </div>
                    </div>
                    <div style={{ padding:'0 14px 12px', display:'flex', flexWrap:'wrap', gap:4 }}>
                      {p.features.slice(0,4).map((f, i) => (
                        <span key={i} style={{ fontSize:11, color:'#6B9080', background:'#F4FAF7', padding:'2px 8px', borderRadius:20 }}>✓ {f}</span>
                      ))}
                      {p.features.length > 4 && (
                        <span style={{ fontSize:11, color:'#A8C4B8', padding:'2px 8px' }}>+{p.features.length - 4} más</span>
                      )}
                    </div>
                    {planActivo !== p.plan && (
                      <div style={{ padding:'0 14px 12px' }}>
                        <button onClick={() => iniciarPago(p.plan)} disabled={iniciandoPago}
                          style={{ width:'100%', padding:'9px', background: iniciandoPago ? '#A8C4B8' : p.destacado ? '#0A9E6E' : '#063D2A', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor: iniciandoPago ? 'not-allowed' : 'pointer' }}>
                          {iniciandoPago ? 'Redirigiendo...' : `Elegir ${p.nombre} — ${p.precio}€/mes →`}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ fontSize:11.5, color:'#A8C4B8', marginTop:12, textAlign:'center' }}>
                Sin permanencia · Cancela cuando quieras · Pago seguro con Stripe
              </div>
            </div>
          </Section>

          <Section title="Copia de seguridad">
            <div style={{ padding:'14px 0' }}>
              <div style={{ fontSize:13, color:'#6B9080', lineHeight:1.6, marginBottom:14 }}>
                Descarga todos tus datos — clientes, reservas, servicios, empleados y stock — en un archivo JSON.
              </div>
              <button onClick={async () => {
                setGenerandoBackup(true); setBackupOk(null);
                const result = await generarBackup(negocio.id, negocio.nombre);
                setBackupOk(result.ok); setGenerandoBackup(false);
                if (result.ok) setTimeout(() => setBackupOk(null), 4000);
              }} disabled={generandoBackup}
                style={{ width:'100%', padding:'10px', background: generandoBackup ? '#A8C4B8' : '#063D2A', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: generandoBackup ? 'not-allowed' : 'pointer', marginBottom:10 }}>
                {generandoBackup ? 'Generando backup...' : '⬇️ Descargar backup completo'}
              </button>
              {backupOk === true && <div style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:8, padding:'8px 12px', fontSize:12.5, color:'#063D2A', fontWeight:600 }}>✓ Backup descargado correctamente</div>}
              {backupOk === false && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'8px 12px', fontSize:12.5, color:'#EF4444' }}>Error al generar el backup. Inténtalo de nuevo.</div>}
              <div style={{ fontSize:11.5, color:'#A8C4B8', marginTop:10, lineHeight:1.5 }}>Se recomienda hacer una copia mensual.</div>
            </div>
          </Section>

          <Section title="Widget embebible">
            <div style={{ padding:'14px 0' }}>
              <div style={{ fontSize:13, color:'#6B9080', lineHeight:1.6, marginBottom:14 }}>
                Pega este código en tu web para que tus clientes reserven sin salir de ella.
                {!puede('widget') && <span style={{ color:'#F59E0B', fontWeight:600 }}> — Disponible en Plan Pro</span>}
              </div>
              <div style={{ background:'#0B1E16', borderRadius:10, padding:'14px 16px', marginBottom:12, overflowX:'auto', opacity: puede('widget') ? 1 : 0.4 }}>
                <code style={{ fontSize:11.5, color:'#7FFFD4', fontFamily:'DM Mono, monospace', whiteSpace:'nowrap' }}>
                  {`<script src="https://getreservly.com/widget.js" data-negocio="${negocio?.slug || 'tu-slug'}"></script>`}
                </code>
              </div>
              {puede('widget') ? (
                <button onClick={() => {
                  navigator.clipboard.writeText(`<script src="https://getreservly.com/widget.js" data-negocio="${negocio?.slug || ''}"></script>`);
                  alert('Código copiado al portapapeles');
                }} style={{ width:'100%', padding:10, background:'#063D2A', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Copiar código →
                </button>
              ) : (
                <button onClick={() => document.getElementById('plan-seccion')?.scrollIntoView({ behavior:'smooth' })}
                  style={{ width:'100%', padding:10, background:'#F59E0B', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  🔒 Disponible en Plan Pro — 39€/mes →
                </button>
              )}
              <div style={{ fontSize:11.5, color:'#A8C4B8', marginTop:10 }}>Funciona en cualquier web, Wix, WordPress o Squarespace.</div>
            </div>
          </Section>
        </div>

        {/* ── Col derecha ── */}
        <div>
          <Section title="Notificaciones">
            <Row title="Email al cliente al reservar" desc="Confirmación automática por email">
              <Toggle on={cfg.notif_email} onChange={set('notif_email')}/>
            </Row>
            <Row title="WhatsApp al cliente al reservar" desc="Confirmación automática por WhatsApp">
              <Toggle on={cfg.notif_whatsapp} onChange={set('notif_whatsapp')}/>
            </Row>
            <Row title="Recordatorio de cita" desc="Aviso automático antes de la cita">
              <Toggle on={cfg.recordatorio} onChange={set('recordatorio')}/>
            </Row>
            {cfg.recordatorio && (
              <SelectRow label="Enviar recordatorio" value={cfg.recordatorio_horas}
                onChange={v => setCfg(p => ({...p, recordatorio_horas:parseInt(v)}))}
                options={[
                  { value:1, label:'1 hora antes' }, { value:2, label:'2 horas antes' },
                  { value:24, label:'24 horas antes' }, { value:48, label:'48 horas antes' },
                ]}/>
            )}
            <Row title="Pedir valoración tras la cita" desc="WhatsApp automático post-cita">
              <Toggle on={cfg.valoraciones} onChange={set('valoraciones')}/>
            </Row>
            <div style={{ height:4 }}/>
          </Section>

          <Section title="Reservas y cancelaciones">
            <Row title="Cancelación online por el cliente" desc="El cliente puede cancelar desde el enlace">
              <Toggle on={cfg.cancelacion} onChange={set('cancelacion')}/>
            </Row>
            {cfg.cancelacion && (
              <SelectRow label="Permitir cancelar hasta" value={cfg.cancelacion_horas}
                onChange={v => setCfg(p => ({...p, cancelacion_horas:parseInt(v)}))}
                options={[
                  { value:1, label:'1 hora antes' }, { value:2, label:'2 horas antes' },
                  { value:6, label:'6 horas antes' }, { value:24, label:'24 horas antes' },
                ]}/>
            )}
            <Row title="Señal al reservar" desc="El cliente paga un anticipo para confirmar">
              <Toggle on={cfg.senal} onChange={set('senal')}/>
            </Row>
            {cfg.senal && (
              <div style={{ padding:'12px 0', borderBottom:'1px solid #EAF5EF' }}>
                <div style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:6 }}>Importe de la señal (EUR)</div>
                <input type="number" value={cfg.senal_importe}
                  onChange={e => setCfg(p => ({...p, senal_importe:parseFloat(e.target.value)}))}
                  style={{ ...inputStyle, fontFamily:'DM Mono, monospace' }}/>
              </div>
            )}
            <Row title="Lista de espera automática" desc="El sistema avisa si se libera un hueco">
              <Toggle on={cfg.lista_espera} onChange={set('lista_espera')}/>
            </Row>
            <Row title="Recordatorio de vuelta" desc="WhatsApp para retener clientes">
              <Toggle on={cfg.retencion} onChange={set('retencion')}/>
            </Row>
            {cfg.retencion && (
              <SelectRow label="Enviar recordatorio a las" value={cfg.retencion_semanas}
                onChange={v => setCfg(p => ({...p, retencion_semanas:parseInt(v)}))}
                options={[
                  { value:3, label:'3 semanas sin visita' }, { value:4, label:'4 semanas sin visita' },
                  { value:6, label:'6 semanas sin visita' }, { value:8, label:'8 semanas sin visita' },
                ]}/>
            )}
            <div style={{ height:4 }}/>
          </Section>

          <Section title="Google Calendar">
            <div style={{ padding:'14px 0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, flexWrap:'wrap' }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'#fff', border:'1px solid #D6EDE5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>📅</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16' }}>Sincronizar con Google Calendar</div>
                  <div style={{ fontSize:11.5, color:'#6B9080' }}>Las reservas aparecerán automáticamente en tu calendario</div>
                </div>
                {googleConectado ? (
                  <span style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:20, background:'#E8F7F2', color:'#063D2A', flexShrink:0 }}>● Conectado</span>
                ) : (
                  <span style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:20, background:'#F1F5F9', color:'#6B9080', flexShrink:0 }}>○ Desconectado</span>
                )}
              </div>
              {!googleConectado ? (
                <button onClick={async () => {
                  setGoogleCargando(true); setGoogleMsg('');
                  try {
                    await Promise.all([googleCalendar.cargarScript(), googleCalendar.cargarGSI()]);
                    await googleCalendar.conectar();
                    setGoogleConectado(true);
                    setGoogleMsg('✓ Conectado correctamente');
                    setTimeout(() => setGoogleMsg(''), 3000);
                  } catch (err) {
                    console.error('Error Google Calendar:', err);
                    setGoogleMsg('Error: ' + (err?.message || err?.type || JSON.stringify(err) || 'desconocido'));
                  }
                  setGoogleCargando(false);
                }} disabled={googleCargando}
                  style={{ width:'100%', padding:'10px', background: googleCargando ? '#A8C4B8' : '#4285F4', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: googleCargando ? 'not-allowed' : 'pointer', marginBottom:8 }}>
                  {googleCargando ? 'Conectando...' : '🔗 Conectar con Google Calendar'}
                </button>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <button onClick={async () => {
                    setSincronizando(true); setGoogleMsg('');
                    try {
                      const { data: reservas } = await supabase
                        .from('reservas').select('*, clientes(nombre), servicios(nombre), empleados(nombre)')
                        .eq('negocio_id', negocio.id)
                        .in('estado', ['confirmada','pendiente'])
                        .gte('fecha', new Date().toISOString().split('T')[0]);
                      const resultado = await googleCalendar.sincronizarTodas(reservas || []);
                      setGoogleMsg(`✓ ${resultado.ok} reservas sincronizadas${resultado.error > 0 ? ` (${resultado.error} errores)` : ''}`);
                      setTimeout(() => setGoogleMsg(''), 5000);
                    } catch (err) {
                      setGoogleMsg('Error al sincronizar: ' + err.message);
                    }
                    setSincronizando(false);
                  }} disabled={sincronizando}
                    style={{ width:'100%', padding:'10px', background: sincronizando ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: sincronizando ? 'not-allowed' : 'pointer' }}>
                    {sincronizando ? 'Sincronizando...' : '🔄 Sincronizar reservas futuras'}
                  </button>
                  <button onClick={() => {
                    googleCalendar.desconectar();
                    setGoogleConectado(false);
                    setGoogleMsg('Desconectado de Google Calendar');
                    setTimeout(() => setGoogleMsg(''), 3000);
                  }}
                    style={{ width:'100%', padding:'8px', background:'transparent', color:'#EF4444', border:'1px solid #FECACA', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    Desconectar Google Calendar
                  </button>
                </div>
              )}
              {googleMsg && (
                <div style={{ marginTop:10, padding:'8px 12px', background: googleMsg.startsWith('✓') ? '#E8F7F2' : '#FEF2F2', border:`1px solid ${googleMsg.startsWith('✓') ? '#D6EDE5' : '#FECACA'}`, borderRadius:8, fontSize:12.5, color: googleMsg.startsWith('✓') ? '#063D2A' : '#EF4444', fontWeight:600 }}>
                  {googleMsg}
                </div>
              )}
              <div style={{ fontSize:11.5, color:'#A8C4B8', marginTop:10, lineHeight:1.5 }}>
                Solo sincroniza reservas futuras confirmadas y pendientes.
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}