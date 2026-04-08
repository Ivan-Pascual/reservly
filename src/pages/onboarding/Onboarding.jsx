import React, { useState } from 'react';
import { supabase } from '../../supabase';

const PASOS = [
  'Tipo de negocio',
  'Información básica',
  'Servicios',
  'Empleados',
  'Horario',
  'Notificaciones',
  'Cancelaciones',
  'Listo',
];

const TIPOS = [
  {
    id: 'profesional',
    emoji: '💈',
    titulo: 'Por profesional',
    desc: 'Peluquería, clínica, fisio — cada empleado tiene su propia agenda',
    ejemplos: 'Peluquerías · Clínicas · Fisioterapeutas · Psicólogos',
  },
  {
    id: 'recurso',
    emoji: '🍽️',
    titulo: 'Por recurso',
    desc: 'Restaurante, sala, pista — reservas por mesa o espacio',
    ejemplos: 'Restaurantes · Salas · Pistas de pádel',
  },
  {
    id: 'simple',
    emoji: '📅',
    titulo: 'Simple',
    desc: 'Solo el dueño gestiona — perfecto para autónomos',
    ejemplos: 'Fotógrafos · Consultores · Formadores',
  },
];

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

export default function Onboarding({ negocioId, onComplete }) {
  const [paso, setPaso] = useState(0);
  const [saving, setSaving] = useState(false);

  const [tipo, setTipo] = useState('');
  const [info, setInfo] = useState({ nombre: '', telefono: '', email: '', direccion: '', descripcion: '' });
  const [servicios, setServicios] = useState([{ nombre: '', categoria: '', duracion: 45, precio: '' }]);
  const [empleados, setEmpleados] = useState([{ nombre: '', email: '', color: '#0A9E6E' }]);
  const [horario, setHorario] = useState({
    Lunes: { activo: true, apertura: '09:00', cierre: '18:00' },
    Martes: { activo: true, apertura: '09:00', cierre: '18:00' },
    Miércoles: { activo: true, apertura: '09:00', cierre: '18:00' },
    Jueves: { activo: true, apertura: '09:00', cierre: '18:00' },
    Viernes: { activo: true, apertura: '09:00', cierre: '18:00' },
    Sábado: { activo: false, apertura: '10:00', cierre: '14:00' },
    Domingo: { activo: false, apertura: '10:00', cierre: '14:00' },
  });
  const [notif, setNotif] = useState({
    notif_email: true, notif_whatsapp: true,
    recordatorio: true, recordatorio_horas: 2,
    valoraciones: true,
  });
  const [cancelacion, setCancelacion] = useState({
    cancelacion: true, cancelacion_horas: 2,
    senal: false, senal_importe: 10,
  });

  const COLORES = ['#0A9E6E','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6'];

  const siguiente = () => setPaso(p => Math.min(p + 1, PASOS.length - 1));
  const anterior = () => setPaso(p => Math.max(p - 1, 0));

  const guardarTodo = async () => {
    setSaving(true);

    // Actualizar negocio
    await supabase.from('negocios').update({
      nombre: info.nombre || undefined,
      tipo,
    }).eq('id', negocioId);

    // Guardar servicios
    const serviciosValidos = servicios.filter(s => s.nombre.trim());
    if (serviciosValidos.length > 0) {
      await supabase.from('servicios').insert(
        serviciosValidos.map(s => ({
          negocio_id: negocioId,
          nombre: s.nombre,
          categoria: s.categoria || 'General',
          duracion: parseInt(s.duracion) || 45,
          precio: s.precio ? parseFloat(s.precio) : null,
          activo: true,
        }))
      );
    }

    // Guardar empleados (solo si tipo profesional)
    if (tipo === 'profesional') {
      const empleadosValidos = empleados.filter(e => e.nombre.trim());
      if (empleadosValidos.length > 0) {
        await supabase.from('empleados').insert(
          empleadosValidos.map(e => ({
            negocio_id: negocioId,
            nombre: e.nombre,
            email: e.email || null,
            color: e.color,
            activo: true,
            tipo_comision: 'ninguna',
            comision_valor: 0,
          }))
        );
      }
    }

    // Guardar configuración
    await supabase.from('configuracion').upsert({
      negocio_id: negocioId,
      ...notif,
      ...cancelacion,
    });

    // Marcar onboarding como completado
    await supabase.from('negocios').update({ onboarding_completado: true }).eq('id', negocioId);

    setSaving(false);
    onComplete();
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #D6EDE5', borderRadius: 8,
    fontSize: 13.5, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', background: '#F4FAF7',
  };

  const Toggle = ({ on, onChange }) => (
    <div onClick={() => onChange(!on)} style={{
      width: 40, height: 22, borderRadius: 11,
      background: on ? '#0A9E6E' : '#D6EDE5',
      position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', width: 16, height: 16, borderRadius: '50%',
        background: '#fff', top: 3, left: on ? 21 : 3,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}/>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F4FAF7', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: '#063D2A', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
              stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="white"/>
            <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Reservly</span>
        </div>
        <div style={{ fontSize: 12, color: '#ffffff60' }}>Paso {paso + 1} de {PASOS.length}</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#D6EDE5' }}>
        <div style={{ height: '100%', background: '#0A9E6E', width: `${((paso + 1) / PASOS.length) * 100}%`, transition: 'width 0.3s' }}/>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>

          {/* ── PASO 0: Tipo de negocio ── */}
          {paso === 0 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0B1E16', marginBottom: 8 }}>¿Qué tipo de negocio tienes?</h2>
              <p style={{ fontSize: 14, color: '#6B9080', marginBottom: 28 }}>Esto configura cómo funciona tu agenda de reservas.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {TIPOS.map(t => (
                  <div key={t.id} onClick={() => setTipo(t.id)} style={{
                    background: '#fff', border: `2px solid ${tipo === t.id ? '#0A9E6E' : '#EAF5EF'}`,
                    borderRadius: 14, padding: '20px 24px', cursor: 'pointer', transition: 'all 0.15s',
                    background: tipo === t.id ? '#E8F7F2' : '#fff',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 32 }}>{t.emoji}</span>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0B1E16' }}>{t.titulo}</div>
                        <div style={{ fontSize: 13, color: '#6B9080', marginTop: 3 }}>{t.desc}</div>
                        <div style={{ fontSize: 11.5, color: '#A8C4B8', marginTop: 4 }}>{t.ejemplos}</div>
                      </div>
                      {tipo === t.id && (
                        <div style={{ marginLeft: 'auto', width: 24, height: 24, borderRadius: '50%', background: '#0A9E6E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PASO 1: Información básica ── */}
          {paso === 1 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0B1E16', marginBottom: 8 }}>Cuéntanos sobre tu negocio</h2>
              <p style={{ fontSize: 14, color: '#6B9080', marginBottom: 28 }}>Esta información aparecerá en tu página pública de reservas.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'nombre', label: 'Nombre del negocio *', placeholder: 'Ej: Peluquería Mía' },
                  { key: 'telefono', label: 'Teléfono', placeholder: '+34 974 000 000' },
                  { key: 'email', label: 'Email de contacto', placeholder: 'info@tunegocio.com', type: 'email' },
                  { key: 'direccion', label: 'Dirección', placeholder: 'Calle Mayor 14, Huesca' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>{f.label}</label>
                    <input value={info[f.key]} onChange={e => setInfo({ ...info, [f.key]: e.target.value })}
                      placeholder={f.placeholder} type={f.type || 'text'} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#0A9E6E'}
                      onBlur={e => e.target.style.borderColor = '#D6EDE5'}/>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>Descripción</label>
                  <textarea value={info.descripcion} onChange={e => setInfo({ ...info, descripcion: e.target.value })}
                    placeholder="Describe tu negocio en pocas palabras..."
                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = '#0A9E6E'}
                    onBlur={e => e.target.style.borderColor = '#D6EDE5'}/>
                </div>
              </div>
            </div>
          )}

          {/* ── PASO 2: Servicios ── */}
          {paso === 2 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0B1E16', marginBottom: 8 }}>¿Qué servicios ofreces?</h2>
              <p style={{ fontSize: 14, color: '#6B9080', marginBottom: 28 }}>Añade tus servicios principales. Puedes añadir más después.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {servicios.map((s, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Nombre *</label>
                        <input value={s.nombre} onChange={e => { const n = [...servicios]; n[i].nombre = e.target.value; setServicios(n); }}
                          placeholder="Ej: Corte de pelo" style={inputStyle}/>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Categoría</label>
                        <input value={s.categoria} onChange={e => { const n = [...servicios]; n[i].categoria = e.target.value; setServicios(n); }}
                          placeholder="Corte, Color..." style={inputStyle}/>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Duración (min)</label>
                        <input type="number" value={s.duracion} onChange={e => { const n = [...servicios]; n[i].duracion = e.target.value; setServicios(n); }}
                          style={{ ...inputStyle, fontFamily: 'DM Mono, monospace' }}/>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Precio (EUR)</label>
                        <input type="number" value={s.precio} onChange={e => { const n = [...servicios]; n[i].precio = e.target.value; setServicios(n); }}
                          placeholder="0" style={{ ...inputStyle, fontFamily: 'DM Mono, monospace' }}/>
                      </div>
                    </div>
                    {servicios.length > 1 && (
                      <button onClick={() => setServicios(servicios.filter((_, j) => j !== i))}
                        style={{ marginTop: 10, background: 'transparent', border: 'none', color: '#EF4444', fontSize: 12, cursor: 'pointer' }}>
                        Eliminar servicio
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setServicios([...servicios, { nombre: '', categoria: '', duracion: 45, precio: '' }])}
                  style={{ background: 'transparent', border: '1.5px dashed #D6EDE5', borderRadius: 12, padding: 14, color: '#6B9080', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.target.style.borderColor = '#0A9E6E'; e.target.style.color = '#0A9E6E'; }}
                  onMouseLeave={e => { e.target.style.borderColor = '#D6EDE5'; e.target.style.color = '#6B9080'; }}>
                  + Añadir otro servicio
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 3: Empleados ── */}
          {paso === 3 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0B1E16', marginBottom: 8 }}>
                {tipo === 'profesional' ? '¿Quiénes trabajan contigo?' : 'Equipo'}
              </h2>
              <p style={{ fontSize: 14, color: '#6B9080', marginBottom: 28 }}>
                {tipo === 'profesional'
                  ? 'Añade a tus empleados. Cada uno tendrá su propia agenda.'
                  : 'En tu tipo de negocio no necesitas configurar empleados. Puedes añadirlos después.'}
              </p>
              {tipo === 'profesional' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {empleados.map((e, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 12 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Nombre *</label>
                          <input value={e.nombre} onChange={ev => { const n = [...empleados]; n[i].nombre = ev.target.value; setEmpleados(n); }}
                            placeholder="Ej: María García" style={inputStyle}/>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Email</label>
                          <input value={e.email} onChange={ev => { const n = [...empleados]; n[i].email = ev.target.value; setEmpleados(n); }}
                            placeholder="maria@email.com" type="email" style={inputStyle}/>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Color</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {COLORES.map(c => (
                            <div key={c} onClick={() => { const n = [...empleados]; n[i].color = c; setEmpleados(n); }}
                              style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                                border: e.color === c ? '3px solid #0B1E16' : '3px solid transparent' }}/>
                          ))}
                        </div>
                      </div>
                      {empleados.length > 1 && (
                        <button onClick={() => setEmpleados(empleados.filter((_, j) => j !== i))}
                          style={{ marginTop: 10, background: 'transparent', border: 'none', color: '#EF4444', fontSize: 12, cursor: 'pointer' }}>
                          Eliminar empleado
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setEmpleados([...empleados, { nombre: '', email: '', color: '#3B82F6' }])}
                    style={{ background: 'transparent', border: '1.5px dashed #D6EDE5', borderRadius: 12, padding: 14, color: '#6B9080', fontSize: 13, cursor: 'pointer' }}
                    onMouseEnter={e => { e.target.style.borderColor = '#0A9E6E'; e.target.style.color = '#0A9E6E'; }}
                    onMouseLeave={e => { e.target.style.borderColor = '#D6EDE5'; e.target.style.color = '#6B9080'; }}>
                    + Añadir otro empleado
                  </button>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 14, padding: '40px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0B1E16' }}>No necesitas empleados ahora</div>
                  <div style={{ fontSize: 13, color: '#6B9080', marginTop: 6 }}>Puedes añadirlos después desde el panel</div>
                </div>
              )}
            </div>
          )}

          {/* ── PASO 4: Horario ── */}
          {paso === 4 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0B1E16', marginBottom: 8 }}>¿Cuál es tu horario?</h2>
              <p style={{ fontSize: 14, color: '#6B9080', marginBottom: 28 }}>Los clientes solo podrán reservar en estos horarios.</p>
              <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 14, overflow: 'hidden' }}>
                {DIAS.map((dia, i) => {
                  const h = horario[dia];
                  return (
                    <div key={dia} style={{ display: 'grid', gridTemplateColumns: '120px 60px 1fr', gap: 16, padding: '14px 20px', borderBottom: i < DIAS.length - 1 ? '1px solid #EAF5EF' : 'none', alignItems: 'center' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: h.activo ? '#0B1E16' : '#A8C4B8' }}>{dia}</div>
                      <div onClick={() => setHorario({ ...horario, [dia]: { ...h, activo: !h.activo } })}
                        style={{ width: 40, height: 22, borderRadius: 11, background: h.activo ? '#0A9E6E' : '#D6EDE5', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                        <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: h.activo ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
                      </div>
                      {h.activo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input type="time" value={h.apertura} onChange={e => setHorario({ ...horario, [dia]: { ...h, apertura: e.target.value } })}
                            style={{ padding: '6px 10px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 13, fontFamily: 'DM Mono, monospace', outline: 'none' }}/>
                          <span style={{ color: '#A8C4B8', fontSize: 12 }}>—</span>
                          <input type="time" value={h.cierre} onChange={e => setHorario({ ...horario, [dia]: { ...h, cierre: e.target.value } })}
                            style={{ padding: '6px 10px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 13, fontFamily: 'DM Mono, monospace', outline: 'none' }}/>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: '#A8C4B8' }}>Cerrado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PASO 5: Notificaciones ── */}
          {paso === 5 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0B1E16', marginBottom: 8 }}>Notificaciones</h2>
              <p style={{ fontSize: 14, color: '#6B9080', marginBottom: 28 }}>¿Cómo quieres comunicarte con tus clientes?</p>
              <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 14, overflow: 'hidden' }}>
                {[
                  { key: 'notif_email', title: 'Confirmación por email', desc: 'El cliente recibe un email al reservar' },
                  { key: 'notif_whatsapp', title: 'Confirmación por WhatsApp', desc: 'El cliente recibe un WhatsApp al reservar' },
                  { key: 'recordatorio', title: 'Recordatorio de cita', desc: 'Aviso automático antes de la cita' },
                  { key: 'valoraciones', title: 'Pedir valoración tras la cita', desc: 'WhatsApp automático para que el cliente valore' },
                ].map((item, i, arr) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: i < arr.length - 1 ? '1px solid #EAF5EF' : 'none', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1E16' }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: '#6B9080', marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <Toggle on={notif[item.key]} onChange={v => setNotif({ ...notif, [item.key]: v })}/>
                  </div>
                ))}
              </div>
              {notif.recordatorio && (
                <div style={{ marginTop: 16, background: '#fff', border: '1px solid #EAF5EF', borderRadius: 12, padding: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Enviar recordatorio</label>
                  <select value={notif.recordatorio_horas} onChange={e => setNotif({ ...notif, recordatorio_horas: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 13, fontFamily: 'DM Sans, sans-serif', background: '#F4FAF7' }}>
                    <option value={1}>1 hora antes</option>
                    <option value={2}>2 horas antes</option>
                    <option value={24}>24 horas antes</option>
                    <option value={48}>48 horas antes</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ── PASO 6: Cancelaciones ── */}
          {paso === 6 && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0B1E16', marginBottom: 8 }}>Cancelaciones y pagos</h2>
              <p style={{ fontSize: 14, color: '#6B9080', marginBottom: 28 }}>Define cómo gestionas las cancelaciones.</p>
              <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                {[
                  { key: 'cancelacion', title: 'Permitir cancelación online', desc: 'El cliente puede cancelar desde el enlace del email' },
                  { key: 'senal', title: 'Cobrar señal al reservar', desc: 'El cliente paga un anticipo para confirmar la reserva' },
                ].map((item, i, arr) => (
                  <div key={item.key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EAF5EF', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1E16' }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: '#6B9080', marginTop: 2 }}>{item.desc}</div>
                      </div>
                      <Toggle on={cancelacion[item.key]} onChange={v => setCancelacion({ ...cancelacion, [item.key]: v })}/>
                    </div>
                    {item.key === 'cancelacion' && cancelacion.cancelacion && (
                      <div style={{ padding: '12px 20px', borderBottom: '1px solid #EAF5EF', background: '#F4FAF7' }}>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Permitir cancelar hasta</label>
                        <select value={cancelacion.cancelacion_horas} onChange={e => setCancelacion({ ...cancelacion, cancelacion_horas: parseInt(e.target.value) })}
                          style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 13, fontFamily: 'DM Sans, sans-serif', background: '#fff' }}>
                          <option value={1}>1 hora antes</option>
                          <option value={2}>2 horas antes</option>
                          <option value={6}>6 horas antes</option>
                          <option value={24}>24 horas antes</option>
                        </select>
                      </div>
                    )}
                    {item.key === 'senal' && cancelacion.senal && (
                      <div style={{ padding: '12px 20px', background: '#F4FAF7' }}>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Importe de la señal (EUR)</label>
                        <input type="number" value={cancelacion.senal_importe} onChange={e => setCancelacion({ ...cancelacion, senal_importe: parseFloat(e.target.value) })}
                          style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 13, fontFamily: 'DM Mono, monospace', outline: 'none', background: '#fff' }}/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PASO 7: Listo ── */}
          {paso === 7 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0B1E16', marginBottom: 12 }}>¡Todo listo!</h2>
              <p style={{ fontSize: 15, color: '#6B9080', marginBottom: 32, lineHeight: 1.6 }}>
                Tu negocio está configurado. Ya puedes empezar a recibir reservas en{' '}
                <strong style={{ color: '#0A9E6E' }}>reservly.com/{info.nombre?.toLowerCase().replace(/\s+/g, '-') || 'tu-negocio'}</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32, textAlign: 'left' }}>
                {[
                  { emoji: '✅', title: 'Tipo configurado', desc: TIPOS.find(t2 => t2.id === tipo)?.titulo || tipo },
                  { emoji: '✅', title: 'Servicios añadidos', desc: `${servicios.filter(s => s.nombre).length} servicios` },
                  { emoji: '✅', title: 'Notificaciones', desc: 'Email y WhatsApp' },
                ].map(item => (
                  <div key={item.title} style={{ background: '#E8F7F2', border: '1px solid #D6EDE5', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{item.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0B1E16' }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#6B9080', marginTop: 2 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={guardarTodo} disabled={saving}
                style={{ background: saving ? '#A8C4B8' : '#0A9E6E', color: '#fff', border: 'none', padding: '14px 40px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
                {saving ? 'Guardando...' : 'Entrar al panel →'}
              </button>
            </div>
          )}

          {/* Navegación */}
          {paso < 7 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
              <button onClick={anterior} disabled={paso === 0}
                style={{ background: 'transparent', border: '1.5px solid #D6EDE5', color: '#6B9080', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: paso === 0 ? 'not-allowed' : 'pointer', opacity: paso === 0 ? 0.4 : 1 }}>
                ← Anterior
              </button>
              <button onClick={siguiente}
                disabled={paso === 0 && !tipo}
                style={{ background: (paso === 0 && !tipo) ? '#A8C4B8' : '#0A9E6E', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: (paso === 0 && !tipo) ? 'not-allowed' : 'pointer' }}>
                Siguiente →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}