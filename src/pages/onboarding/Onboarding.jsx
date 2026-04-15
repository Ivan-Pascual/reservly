import React, { useState } from 'react';
import { supabase } from '../../supabase';

const PASOS = [
  { label:'Tipo',          emoji:'🏢' },
  { label:'Información',   emoji:'📝' },
  { label:'Servicios',     emoji:'✂️' },
  { label:'Equipo',        emoji:'👥' },
  { label:'Horario',       emoji:'🕐' },
  { label:'Notificaciones',emoji:'🔔' },
  { label:'Cancelaciones', emoji:'📋' },
  { label:'¡Listo!',       emoji:'🎉' },
];

const TIPOS = [
  { id:'profesional', emoji:'💈', titulo:'Por profesional', desc:'Cada empleado tiene su propia agenda', ejemplos:'Peluquerías · Clínicas · Fisioterapeutas · Psicólogos' },
  { id:'recurso',     emoji:'🍽️', titulo:'Por recurso',     desc:'Reservas por mesa, sala o espacio',   ejemplos:'Restaurantes · Salas · Pistas de pádel' },
  { id:'simple',      emoji:'📅', titulo:'Simple',          desc:'Solo el dueño gestiona la agenda',    ejemplos:'Fotógrafos · Consultores · Formadores' },
];

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const COLORES = ['#0A9E6E','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6'];

const Toggle = ({ on, onChange }) => (
  <div onClick={() => onChange(!on)} style={{ width:40, height:22, borderRadius:11, background: on ? '#0A9E6E' : '#D6EDE5', position:'relative', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
    <div style={{ position:'absolute', width:16, height:16, borderRadius:'50%', background:'#fff', top:3, left: on ? 21 : 3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
  </div>
);

export default function Onboarding({ negocioId, onComplete }) {
  const [paso, setPaso] = useState(0);
  const [saving, setSaving] = useState(false);
  const [tipo, setTipo] = useState('');
  const [info, setInfo] = useState({ nombre:'', telefono:'', email:'', direccion:'', descripcion:'' });
  const [servicios, setServicios] = useState([{ nombre:'', categoria:'', duracion:45, precio:'' }]);
  const [empleados, setEmpleados] = useState([{ nombre:'', email:'', color:'#0A9E6E' }]);
  const [horario, setHorario] = useState({
    Lunes:     { activo:true,  apertura:'09:00', cierre:'18:00' },
    Martes:    { activo:true,  apertura:'09:00', cierre:'18:00' },
    Miércoles: { activo:true,  apertura:'09:00', cierre:'18:00' },
    Jueves:    { activo:true,  apertura:'09:00', cierre:'18:00' },
    Viernes:   { activo:true,  apertura:'09:00', cierre:'18:00' },
    Sábado:    { activo:false, apertura:'10:00', cierre:'14:00' },
    Domingo:   { activo:false, apertura:'10:00', cierre:'14:00' },
  });
  const [notif, setNotif] = useState({
    notif_email:true, notif_whatsapp:true,
    recordatorio:true, recordatorio_horas:2, valoraciones:true,
  });
  const [cancelacion, setCancelacion] = useState({
    cancelacion:true, cancelacion_horas:2,
    senal:false, senal_importe:10,
  });

  const siguiente = () => setPaso(p => Math.min(p+1, PASOS.length-1));
  const anterior  = () => setPaso(p => Math.max(p-1, 0));

  const guardarTodo = async () => {
    setSaving(true);

    const slugBase = (info.nombre || 'negocio').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');

    await supabase.from('negocios').update({
      nombre:    info.nombre    || undefined,
      telefono:  info.telefono  || null,
      email:     info.email     || null,
      direccion: info.direccion || null,
      descripcion: info.descripcion || null,
      slug:      slugBase,
      tipo,
    }).eq('id', negocioId);

    const serviciosValidos = servicios.filter(s => s.nombre.trim());
    if (serviciosValidos.length > 0) {
      await supabase.from('servicios').insert(serviciosValidos.map(s => ({
        negocio_id: negocioId,
        nombre:     s.nombre,
        categoria:  s.categoria || 'General',
        duracion:   parseInt(s.duracion) || 45,
        precio:     s.precio ? parseFloat(s.precio) : null,
        activo:     true,
      })));
    }

    if (tipo === 'profesional') {
      const empleadosValidos = empleados.filter(e => e.nombre.trim());
      if (empleadosValidos.length > 0) {
        await supabase.from('empleados').insert(empleadosValidos.map(e => ({
          negocio_id: negocioId, nombre: e.nombre,
          email: e.email || null, color: e.color,
          activo: true, tipo_comision:'ninguna', comision_valor:0,
        })));
      }
    }

    const diasMap = { Lunes:'lunes', Martes:'martes', Miércoles:'miercoles', Jueves:'jueves', Viernes:'viernes', Sábado:'sabado', Domingo:'domingo' };
    const horarioPayload = {};
    Object.entries(horario).forEach(([dia, h]) => {
      const key = diasMap[dia];
      horarioPayload[`horario_${key}_activo`]   = h.activo;
      horarioPayload[`horario_${key}_apertura`] = h.apertura;
      horarioPayload[`horario_${key}_cierre`]   = h.cierre;
    });

    await supabase.from('configuracion').upsert({
      negocio_id: negocioId, ...notif, ...cancelacion, ...horarioPayload,
    });

    await supabase.from('negocios').update({ onboarding_completado:true }).eq('id', negocioId);
    setSaving(false);
    onComplete();
  };

  const inputStyle = {
    width:'100%', padding:'10px 14px',
    border:'1.5px solid #D6EDE5', borderRadius:8,
    fontSize:13.5, fontFamily:'DM Sans, sans-serif',
    outline:'none', background:'#F4FAF7',
  };

  const progreso = ((paso+1) / PASOS.length) * 100;

  return (
    <div style={{ minHeight:'100vh', background:'#F4FAF7', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ background:'#063D2A', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
              stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="white"/>
            <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
          </svg>
          <span style={{ fontSize:16, fontWeight:700, color:'#fff' }}>Reservly</span>
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>
          {paso+1} de {PASOS.length}
        </div>
      </div>

      {/* Barra progreso */}
      <div style={{ height:4, background:'#D6EDE5' }}>
        <div style={{ height:'100%', background:'#0A9E6E', width:`${progreso}%`, transition:'width 0.4s ease' }}/>
      </div>

      {/* Steps indicador — solo desktop */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'12px 24px', display:'flex', gap:4, overflowX:'auto' }}>
        {PASOS.map((p, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700,
              background: i < paso ? '#0A9E6E' : i === paso ? '#063D2A' : '#F4FAF7',
              color: i <= paso ? '#fff' : '#A8C4B8',
              border: i === paso ? 'none' : i < paso ? 'none' : '1px solid #D6EDE5',
            }}>
              {i < paso ? '✓' : i+1}
            </div>
            {!window.matchMedia('(max-width:600px)').matches && (
              <span style={{ fontSize:12, fontWeight: i===paso ? 600 : 400, color: i===paso ? '#063D2A' : i<paso ? '#0A9E6E' : '#A8C4B8' }}>
                {p.label}
              </span>
            )}
            {i < PASOS.length-1 && <div style={{ width:16, height:1, background:'#EAF5EF', margin:'0 2px' }}/>}
          </div>
        ))}
      </div>

      {/* Contenido */}
      <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'32px 16px 40px' }}>
        <div style={{ width:'100%', maxWidth:640 }}>

          {/* PASO 0 — Tipo */}
{paso === 0 && (
  <div>
    <h2 style={{ fontSize:'clamp(22px,4vw,28px)', fontWeight:700, color:'#0B1E16', marginBottom:8 }}>¿Qué tipo de negocio tienes?</h2>
    <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>Esto configura cómo funciona tu agenda. Elige el que más se parezca a tu negocio.</p>
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {[
        {
          id:'profesional',
          emoji:'💈',
          titulo:'Por profesional',
          desc:'Cada persona de tu equipo tiene su propia agenda. El cliente elige con quién quiere la cita.',
          ejemplos:['Peluquería con 2 o más estilistas', 'Clínica con varios fisioterapeutas', 'Centro de estética con varias esteticistas'],
          cuando:'Cuando tienes empleados y cada uno atiende por separado',
          color:'#0A9E6E',
        },
        {
          id:'recurso',
          emoji:'🍽️',
          titulo:'Por recurso o espacio',
          desc:'Las reservas son por un espacio, mesa o pista. No importa quién atiende, sino qué está disponible.',
          ejemplos:['Restaurante con mesas reservables', 'Club de pádel con pistas', 'Sala de reuniones o coworking'],
          cuando:'Cuando lo que se reserva es un espacio, no una persona',
          color:'#3B82F6',
        },
        {
          id:'simple',
          emoji:'📅',
          titulo:'Simple — solo yo',
          desc:'Eres tú solo quien atiende. Los clientes reservan una cita contigo directamente.',
          ejemplos:['Fotógrafo autónomo', 'Consultor o coach', 'Médico o terapeuta en solitario'],
          cuando:'Cuando trabajas solo o no necesitas diferenciar empleados',
          color:'#8B5CF6',
        },
      ].map(t => (
        <div key={t.id} onClick={() => setTipo(t.id)} style={{
          background: tipo===t.id ? '#E8F7F2' : '#fff',
          border:`2px solid ${tipo===t.id ? t.color : '#EAF5EF'}`,
          borderRadius:14, padding:'18px 20px', cursor:'pointer', transition:'all 0.15s',
        }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:12, background: tipo===t.id ? t.color+'20' : '#F4FAF7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
              {t.emoji}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>{t.titulo}</div>
                <div style={{ width:22, height:22, borderRadius:'50%', background: tipo===t.id ? t.color : '#EAF5EF', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, flexShrink:0 }}>
                  {tipo===t.id ? '✓' : ''}
                </div>
              </div>
              <div style={{ fontSize:13, color:'#0B1E16', marginBottom:8, lineHeight:1.5 }}>{t.desc}</div>

              {/* Ejemplos */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                {t.ejemplos.map((ej, i) => (
                  <span key={i} style={{ fontSize:11.5, background: tipo===t.id ? t.color+'15' : '#F4FAF7', color: tipo===t.id ? t.color : '#6B9080', padding:'3px 10px', borderRadius:20, border:`1px solid ${tipo===t.id ? t.color+'30' : '#EAF5EF'}` }}>
                    {ej}
                  </span>
                ))}
              </div>

              {/* Cuándo elegirlo */}
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:11, color:'#A8C4B8' }}>💡</span>
                <span style={{ fontSize:12, color:'#A8C4B8', fontStyle:'italic' }}>{t.cuando}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
          {/* PASO 1 — Info */}
          {paso === 1 && (
            <div>
              <h2 style={{ fontSize:'clamp(22px,4vw,28px)', fontWeight:700, color:'#0B1E16', marginBottom:8 }}>Cuéntanos sobre tu negocio</h2>
              <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>Esta información aparece en tu página pública de reservas.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { key:'nombre',    label:'Nombre del negocio *', placeholder:'Ej: Peluquería Mía' },
                  { key:'telefono',  label:'Teléfono',             placeholder:'+34 974 000 000' },
                  { key:'email',     label:'Email de contacto',    placeholder:'info@tunegocio.com', type:'email' },
                  { key:'direccion', label:'Dirección',            placeholder:'Calle Mayor 14, Huesca' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:5 }}>{f.label}</label>
                    <input value={info[f.key]} onChange={e=>setInfo({...info, [f.key]:e.target.value})}
                      placeholder={f.placeholder} type={f.type||'text'} style={inputStyle}
                      onFocus={e=>e.target.style.borderColor='#0A9E6E'}
                      onBlur={e=>e.target.style.borderColor='#D6EDE5'}/>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:5 }}>Descripción</label>
                  <textarea value={info.descripcion} onChange={e=>setInfo({...info, descripcion:e.target.value})}
                    placeholder="Describe tu negocio en pocas palabras..."
                    style={{ ...inputStyle, minHeight:80, resize:'vertical' }}
                    onFocus={e=>e.target.style.borderColor='#0A9E6E'}
                    onBlur={e=>e.target.style.borderColor='#D6EDE5'}/>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2 — Servicios */}
          {paso === 2 && (
            <div>
              <h2 style={{ fontSize:'clamp(22px,4vw,28px)', fontWeight:700, color:'#0B1E16', marginBottom:8 }}>¿Qué servicios ofreces?</h2>
              <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>Añade tus servicios principales. Puedes añadir más después.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {servicios.map((s, i) => (
                  <div key={i} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:16 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:10, marginBottom:10 }}>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', display:'block', marginBottom:4 }}>Nombre *</label>
                        <input value={s.nombre} onChange={e=>{ const n=[...servicios]; n[i].nombre=e.target.value; setServicios(n); }}
                          placeholder="Ej: Corte de pelo" style={inputStyle}/>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', display:'block', marginBottom:4 }}>Categoría</label>
                        <input value={s.categoria} onChange={e=>{ const n=[...servicios]; n[i].categoria=e.target.value; setServicios(n); }}
                          placeholder="Corte, Color..." style={inputStyle}/>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', display:'block', marginBottom:4 }}>Duración (min)</label>
                        <input type="number" value={s.duracion} onChange={e=>{ const n=[...servicios]; n[i].duracion=e.target.value; setServicios(n); }}
                          style={{ ...inputStyle, fontFamily:'DM Mono, monospace' }}/>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', display:'block', marginBottom:4 }}>Precio (EUR)</label>
                        <input type="number" value={s.precio} onChange={e=>{ const n=[...servicios]; n[i].precio=e.target.value; setServicios(n); }}
                          placeholder="0" style={{ ...inputStyle, fontFamily:'DM Mono, monospace' }}/>
                      </div>
                    </div>
                    {servicios.length > 1 && (
                      <button onClick={() => setServicios(servicios.filter((_,j)=>j!==i))}
                        style={{ marginTop:10, background:'transparent', border:'none', color:'#EF4444', fontSize:12, cursor:'pointer' }}>
                        Eliminar servicio
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setServicios([...servicios, { nombre:'', categoria:'', duracion:45, precio:'' }])}
                  style={{ background:'transparent', border:'1.5px dashed #D6EDE5', borderRadius:12, padding:14, color:'#6B9080', fontSize:13, cursor:'pointer' }}
                  onMouseEnter={e=>{ e.target.style.borderColor='#0A9E6E'; e.target.style.color='#0A9E6E'; }}
                  onMouseLeave={e=>{ e.target.style.borderColor='#D6EDE5'; e.target.style.color='#6B9080'; }}>
                  + Añadir otro servicio
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 — Empleados */}
          {paso === 3 && (
            <div>
              <h2 style={{ fontSize:'clamp(22px,4vw,28px)', fontWeight:700, color:'#0B1E16', marginBottom:8 }}>
                {tipo==='profesional' ? '¿Quiénes trabajan contigo?' : 'Equipo'}
              </h2>
              <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>
                {tipo==='profesional' ? 'Cada empleado tendrá su propia agenda.' : 'En tu tipo de negocio no necesitas configurar empleados ahora.'}
              </p>
              {tipo === 'profesional' ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {empleados.map((e, i) => (
                    <div key={i} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:16 }}>
                      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:10, marginBottom:12 }}>
                        <div>
                          <label style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', display:'block', marginBottom:4 }}>Nombre *</label>
                          <input value={e.nombre} onChange={ev=>{ const n=[...empleados]; n[i].nombre=ev.target.value; setEmpleados(n); }}
                            placeholder="Ej: María García" style={inputStyle}/>
                        </div>
                        <div>
                          <label style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', display:'block', marginBottom:4 }}>Email</label>
                          <input value={e.email} onChange={ev=>{ const n=[...empleados]; n[i].email=ev.target.value; setEmpleados(n); }}
                            placeholder="maria@email.com" type="email" style={inputStyle}/>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', display:'block', marginBottom:6 }}>Color en la agenda</label>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          {COLORES.map(c => (
                            <div key={c} onClick={()=>{ const n=[...empleados]; n[i].color=c; setEmpleados(n); }}
                              style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer', border: e.color===c ? '3px solid #0B1E16' : '3px solid transparent', transition:'all 0.15s' }}/>
                          ))}
                        </div>
                      </div>
                      {empleados.length > 1 && (
                        <button onClick={() => setEmpleados(empleados.filter((_,j)=>j!==i))}
                          style={{ marginTop:10, background:'transparent', border:'none', color:'#EF4444', fontSize:12, cursor:'pointer' }}>
                          Eliminar empleado
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setEmpleados([...empleados, { nombre:'', email:'', color:'#3B82F6' }])}
                    style={{ background:'transparent', border:'1.5px dashed #D6EDE5', borderRadius:12, padding:14, color:'#6B9080', fontSize:13, cursor:'pointer' }}
                    onMouseEnter={e=>{ e.target.style.borderColor='#0A9E6E'; e.target.style.color='#0A9E6E'; }}
                    onMouseLeave={e=>{ e.target.style.borderColor='#D6EDE5'; e.target.style.color='#6B9080'; }}>
                    + Añadir otro empleado
                  </button>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'40px', textAlign:'center' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'#0B1E16' }}>No necesitas empleados ahora</div>
                  <div style={{ fontSize:13, color:'#6B9080', marginTop:6 }}>Puedes añadirlos después desde el panel</div>
                </div>
              )}
            </div>
          )}

          {/* PASO 4 — Horario */}
          {paso === 4 && (
            <div>
              <h2 style={{ fontSize:'clamp(22px,4vw,28px)', fontWeight:700, color:'#0B1E16', marginBottom:8 }}>¿Cuál es tu horario?</h2>
              <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>Los clientes solo podrán reservar en estos horarios.</p>
              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
                {DIAS.map((dia, i) => {
                  const h = horario[dia];
                  return (
                    <div key={dia} style={{ display:'grid', gridTemplateColumns:'100px 50px 1fr', gap:12, padding:'13px 18px', borderBottom: i<DIAS.length-1?'1px solid #EAF5EF':'none', alignItems:'center' }}>
                      <div style={{ fontSize:13.5, fontWeight:600, color: h.activo ? '#0B1E16' : '#A8C4B8' }}>{dia}</div>
                      <Toggle on={h.activo} onChange={v => setHorario({...horario, [dia]:{...h, activo:v}})}/>
                      {h.activo ? (
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          <input type="time" value={h.apertura} onChange={e=>setHorario({...horario, [dia]:{...h, apertura:e.target.value}})}
                            style={{ padding:'6px 8px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none' }}/>
                          <span style={{ color:'#A8C4B8', fontSize:12 }}>—</span>
                          <input type="time" value={h.cierre} onChange={e=>setHorario({...horario, [dia]:{...h, cierre:e.target.value}})}
                            style={{ padding:'6px 8px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none' }}/>
                        </div>
                      ) : (
                        <span style={{ fontSize:13, color:'#A8C4B8' }}>Cerrado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 5 — Notificaciones */}
          {paso === 5 && (
            <div>
              <h2 style={{ fontSize:'clamp(22px,4vw,28px)', fontWeight:700, color:'#0B1E16', marginBottom:8 }}>Notificaciones</h2>
              <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>¿Cómo quieres comunicarte con tus clientes?</p>
              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
                {[
                  { key:'notif_email',    title:'Confirmación por email',     desc:'El cliente recibe un email al reservar' },
                  { key:'notif_whatsapp', title:'Confirmación por WhatsApp',  desc:'El cliente recibe un WhatsApp al reservar' },
                  { key:'recordatorio',   title:'Recordatorio de cita',       desc:'Aviso automático antes de la cita' },
                  { key:'valoraciones',   title:'Pedir valoración tras cita',  desc:'WhatsApp automático post-cita' },
                ].map((item, i, arr) => (
                  <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom: i<arr.length-1?'1px solid #EAF5EF':'none', gap:16 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:'#0B1E16' }}>{item.title}</div>
                      <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>{item.desc}</div>
                    </div>
                    <Toggle on={notif[item.key]} onChange={v=>setNotif({...notif, [item.key]:v})}/>
                  </div>
                ))}
              </div>
              {notif.recordatorio && (
                <div style={{ marginTop:14, background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:16 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:'#6B9080', textTransform:'uppercase', display:'block', marginBottom:8 }}>Enviar recordatorio</label>
                  <select value={notif.recordatorio_horas} onChange={e=>setNotif({...notif, recordatorio_horas:parseInt(e.target.value)})}
                    style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', background:'#F4FAF7' }}>
                    <option value={1}>1 hora antes</option>
                    <option value={2}>2 horas antes</option>
                    <option value={24}>24 horas antes</option>
                    <option value={48}>48 horas antes</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* PASO 6 — Cancelaciones */}
          {paso === 6 && (
            <div>
              <h2 style={{ fontSize:'clamp(22px,4vw,28px)', fontWeight:700, color:'#0B1E16', marginBottom:8 }}>Cancelaciones y pagos</h2>
              <p style={{ fontSize:14, color:'#6B9080', marginBottom:24 }}>Define cómo gestionas las cancelaciones.</p>
              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #EAF5EF', gap:16 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#0B1E16' }}>Permitir cancelación online</div>
                    <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>El cliente puede cancelar desde el enlace del email</div>
                  </div>
                  <Toggle on={cancelacion.cancelacion} onChange={v=>setCancelacion({...cancelacion, cancelacion:v})}/>
                </div>
                {cancelacion.cancelacion && (
                  <div style={{ padding:'12px 20px', borderBottom:'1px solid #EAF5EF', background:'#F4FAF7' }}>
                    <label style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', display:'block', marginBottom:6 }}>Permitir cancelar hasta</label>
                    <select value={cancelacion.cancelacion_horas} onChange={e=>setCancelacion({...cancelacion, cancelacion_horas:parseInt(e.target.value)})}
                      style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', background:'#fff' }}>
                      <option value={1}>1 hora antes</option>
                      <option value={2}>2 horas antes</option>
                      <option value={6}>6 horas antes</option>
                      <option value={24}>24 horas antes</option>
                    </select>
                  </div>
                )}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom: cancelacion.senal ? '1px solid #EAF5EF' : 'none', gap:16 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#0B1E16' }}>Cobrar señal al reservar</div>
                    <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>El cliente paga un anticipo para confirmar</div>
                  </div>
                  <Toggle on={cancelacion.senal} onChange={v=>setCancelacion({...cancelacion, senal:v})}/>
                </div>
                {cancelacion.senal && (
                  <div style={{ padding:'12px 20px', background:'#F4FAF7' }}>
                    <label style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', display:'block', marginBottom:6 }}>Importe de la señal (EUR)</label>
                    <input type="number" value={cancelacion.senal_importe} onChange={e=>setCancelacion({...cancelacion, senal_importe:parseFloat(e.target.value)})}
                      style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none', background:'#fff' }}/>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 7 — Listo */}
          {paso === 7 && (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:72, marginBottom:20 }}>🎉</div>
              <h2 style={{ fontSize:'clamp(22px,4vw,28px)', fontWeight:700, color:'#0B1E16', marginBottom:12 }}>¡Todo listo!</h2>
              <p style={{ fontSize:15, color:'#6B9080', marginBottom:32, lineHeight:1.6 }}>
                Tu negocio está configurado. Ya puedes empezar a recibir reservas.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:32, textAlign:'left' }}>
                {[
                  { emoji:'✅', title:'Tipo configurado',   desc: TIPOS.find(t=>t.id===tipo)?.titulo || tipo },
                  { emoji:'✅', title:'Servicios añadidos', desc:`${servicios.filter(s=>s.nombre).length} servicios` },
                  { emoji:'✅', title:'Horario definido',   desc:'Listo para reservas' },
                  { emoji:'✅', title:'Notificaciones',     desc:'Email configurado' },
                ].map(item => (
                  <div key={item.title} style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:12, padding:16 }}>
                    <div style={{ fontSize:20, marginBottom:6 }}>{item.emoji}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16' }}>{item.title}</div>
                    <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={guardarTodo} disabled={saving}
                style={{ background: saving ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', padding:'14px 40px', borderRadius:12, fontSize:15, fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Configurando...' : 'Entrar al panel →'}
              </button>
            </div>
          )}

          {/* Navegación */}
          {paso < 7 && (
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:28, gap:10 }}>
              <button onClick={anterior} disabled={paso===0}
                style={{ background:'transparent', border:'1.5px solid #D6EDE5', color:'#6B9080', padding:'10px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor: paso===0?'not-allowed':'pointer', opacity: paso===0?0.4:1 }}>
                ← Anterior
              </button>
              <button onClick={siguiente} disabled={paso===0 && !tipo}
                style={{ background:(paso===0&&!tipo)?'#A8C4B8':'#0A9E6E', color:'#fff', border:'none', padding:'10px 28px', borderRadius:8, fontSize:13, fontWeight:600, cursor:(paso===0&&!tipo)?'not-allowed':'pointer' }}>
                Siguiente →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}