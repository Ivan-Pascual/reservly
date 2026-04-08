import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { slugificar } from '../../utils/helpers';

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


export default function Ajustes() {
  const { negocio, loading: negocioLoading } = useNegocio();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [info, setInfo] = useState({
    nombre: '', telefono: '', email: '', direccion: '', slug: '',
  });

  const [cfg, setCfg] = useState({
    notif_email: true, notif_whatsapp: true,
    recordatorio: true, recordatorio_horas: 2,
    valoraciones: true,
    cancelacion: true, cancelacion_horas: 2,
    senal: false, senal_importe: 10,
    lista_espera: true, retencion: true, retencion_semanas: 4,
  });

  const [horario, setHorario] = useState({
    lunes:     { activo: true,  apertura: '09:00', cierre: '18:00' },
    martes:    { activo: true,  apertura: '09:00', cierre: '18:00' },
    miercoles: { activo: true,  apertura: '09:00', cierre: '18:00' },
    jueves:    { activo: true,  apertura: '09:00', cierre: '18:00' },
    viernes:   { activo: true,  apertura: '09:00', cierre: '18:00' },
    sabado:    { activo: false, apertura: '10:00', cierre: '14:00' },
    domingo:   { activo: false, apertura: '10:00', cierre: '14:00' },
  });

  const [tipo, setTipo] = useState('profesional');

  useEffect(() => {
    if (!negocio) return;
    fetchData();
  }, [negocio]);

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
      nombre:    info.nombre,
      telefono:  info.telefono,
      email:     info.email,
      direccion: info.direccion,
      slug:      slugLimpio,
      tipo,
    }).eq('id', negocio.id);

    await supabase.from('configuracion').upsert({
      negocio_id: negocio.id,
      ...cfg,
      horario_lunes_activo:        horario.lunes.activo,
      horario_lunes_apertura:      horario.lunes.apertura,
      horario_lunes_cierre:        horario.lunes.cierre,
      horario_martes_activo:       horario.martes.activo,
      horario_martes_apertura:     horario.martes.apertura,
      horario_martes_cierre:       horario.martes.cierre,
      horario_miercoles_activo:    horario.miercoles.activo,
      horario_miercoles_apertura:  horario.miercoles.apertura,
      horario_miercoles_cierre:    horario.miercoles.cierre,
      horario_jueves_activo:       horario.jueves.activo,
      horario_jueves_apertura:     horario.jueves.apertura,
      horario_jueves_cierre:       horario.jueves.cierre,
      horario_viernes_activo:      horario.viernes.activo,
      horario_viernes_apertura:    horario.viernes.apertura,
      horario_viernes_cierre:      horario.viernes.cierre,
      horario_sabado_activo:       horario.sabado.activo,
      horario_sabado_apertura:     horario.sabado.apertura,
      horario_sabado_cierre:       horario.sabado.cierre,
      horario_domingo_activo:      horario.domingo.activo,
      horario_domingo_apertura:    horario.domingo.apertura,
      horario_domingo_cierre:      horario.domingo.cierre,
    });

    setInfo(p => ({ ...p, slug: slugLimpio }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = k => v => setCfg(p => ({ ...p, [k]: v }));

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #D6EDE5', borderRadius: 8,
    fontSize: 13.5, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', background: '#F4FAF7',
  };

  const Section = ({ title, children }) => (
    <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAF5EF', fontSize: 14, fontWeight: 700, color: '#0B1E16' }}>{title}</div>
      <div style={{ padding: '0 20px' }}>{children}</div>
    </div>
  );

  const Row = ({ title, desc, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #EAF5EF', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1E16' }}>{title}</div>
        {desc && <div style={{ fontSize: 11.5, color: '#6B9080', marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );

  const SelectRow = ({ label, value, onChange, options }) => (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #EAF5EF' }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 13, fontFamily: 'DM Sans, sans-serif', background: '#F4FAF7' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  if (loading || negocioLoading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: '#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

      <div style={{ background: '#fff', borderBottom: '1px solid #EAF5EF', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0B1E16' }}>Ajustes</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 13, color: '#0A9E6E', fontWeight: 600 }}>✓ Guardado</span>}
          <button onClick={guardar} disabled={saving} style={{
            background: saving ? '#A8C4B8' : '#0A9E6E', color: '#fff',
            border: 'none', padding: '8px 20px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Col izquierda */}
        <div>
          <Section title="Información del negocio">
            {[
              { key: 'nombre',    label: 'Nombre del negocio' },
              { key: 'slug',      label: 'URL pública', prefix: 'reservly.com/', mono: true },
              { key: 'telefono',  label: 'Teléfono', mono: true },
              { key: 'email',     label: 'Email de contacto', type: 'email' },
              { key: 'direccion', label: 'Dirección' },
            ].map(f => (
              <div key={f.key} style={{ padding: '12px 0', borderBottom: '1px solid #EAF5EF' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>{f.label}</div>
                {f.prefix ? (
                  <div style={{ display: 'flex', border: '1.5px solid #D6EDE5', borderRadius: 8, overflow: 'hidden' }}>
                    <span style={{ padding: '8px 10px', background: '#EAF5EF', fontSize: 12, color: '#6B9080', borderRight: '1px solid #D6EDE5', whiteSpace: 'nowrap' }}>{f.prefix}</span>
                    <input value={info[f.key]} onChange={e => setInfo({ ...info, [f.key]: e.target.value })}
                      onBlur={() => setInfo(p => ({ ...p, slug: slugificar(p.slug) }))}
                      style={{ flex: 1, padding: '8px 10px', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'DM Mono, monospace', background: '#F4FAF7' }}/>
                  </div>
                ) : (
                  <input value={info[f.key]} onChange={e => setInfo({ ...info, [f.key]: e.target.value })}
                    type={f.type || 'text'}
                    style={{ ...inputStyle, fontFamily: f.mono ? 'DM Mono, monospace' : 'DM Sans, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#0A9E6E'}
                    onBlur={e => e.target.style.borderColor = '#D6EDE5'}/>
                )}
              </div>
            ))}
            <div style={{ height: 12 }}/>
          </Section>

          <Section title="Tipo de negocio">
            <div style={{ padding: '14px 0', borderBottom: '1px solid #EAF5EF' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { v: 'profesional', label: '💈 Por profesional', desc: 'Cada empleado tiene su agenda' },
                  { v: 'recurso',     label: '🍽️ Por recurso',     desc: 'Reservas por mesa o espacio' },
                  { v: 'simple',      label: '📅 Simple',           desc: 'Solo el dueño gestiona' },
                ].map(o => (
                  <label key={o.v} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', border: `1.5px solid ${tipo === o.v ? '#0A9E6E' : '#D6EDE5'}`, borderRadius: 8, cursor: 'pointer', background: tipo === o.v ? '#E8F7F2' : '#F4FAF7' }}>
                    <input type="radio" name="tipo" checked={tipo === o.v} onChange={() => setTipo(o.v)} style={{ marginTop: 2, accentColor: '#0A9E6E' }}/>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1E16' }}>{o.label}</div>
                      <div style={{ fontSize: 11.5, color: '#6B9080', marginTop: 2 }}>{o.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ height: 12 }}/>
          </Section>

          <Section title="Horario de apertura">
            <div style={{ padding: '8px 0' }}>
              {[
                { key: 'lunes',     label: 'Lunes'     },
                { key: 'martes',    label: 'Martes'    },
                { key: 'miercoles', label: 'Miércoles' },
                { key: 'jueves',    label: 'Jueves'    },
                { key: 'viernes',   label: 'Viernes'   },
                { key: 'sabado',    label: 'Sábado'    },
                { key: 'domingo',   label: 'Domingo'   },
              ].map((dia, i, arr) => {
                const h = horario[dia.key];
                return (
                  <div key={dia.key} style={{ display: 'grid', gridTemplateColumns: '90px 44px 1fr', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #EAF5EF' : 'none', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: h.activo ? '#0B1E16' : '#A8C4B8' }}>{dia.label}</div>
                    <div onClick={() => setHorario(p => ({ ...p, [dia.key]: { ...p[dia.key], activo: !p[dia.key].activo } }))}
                      style={{ width: 40, height: 22, borderRadius: 11, background: h.activo ? '#0A9E6E' : '#D6EDE5', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: h.activo ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
                    </div>
                    {h.activo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="time" value={h.apertura}
                          onChange={e => setHorario(p => ({ ...p, [dia.key]: { ...p[dia.key], apertura: e.target.value } }))}
                          style={{ padding: '5px 8px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 12.5, fontFamily: 'DM Mono, monospace', outline: 'none', background: '#F4FAF7' }}/>
                        <span style={{ fontSize: 12, color: '#A8C4B8' }}>—</span>
                        <input type="time" value={h.cierre}
                          onChange={e => setHorario(p => ({ ...p, [dia.key]: { ...p[dia.key], cierre: e.target.value } }))}
                          style={{ padding: '5px 8px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 12.5, fontFamily: 'DM Mono, monospace', outline: 'none', background: '#F4FAF7' }}/>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12.5, color: '#A8C4B8' }}>Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ height: 4 }}/>
          </Section>

          <Section title="Plan y suscripción">
            <div style={{ padding: '14px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0B1E16' }}>Plan Solo</div>
                  <div style={{ fontSize: 12, color: '#6B9080' }}>19 EUR/mes · Prueba gratuita activa</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: '#E8F7F2', color: '#063D2A' }}>● Activo</span>
              </div>
              <button style={{ width: '100%', padding: 10, background: '#0A9E6E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cambiar plan
              </button>
            </div>
          </Section>
        </div>

        {/* Col derecha */}
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
                onChange={v => setCfg(p => ({ ...p, recordatorio_horas: parseInt(v) }))}
                options={[
                  { value: 1,  label: '1 hora antes'   },
                  { value: 2,  label: '2 horas antes'  },
                  { value: 24, label: '24 horas antes' },
                  { value: 48, label: '48 horas antes' },
                ]}/>
            )}
            <Row title="Pedir valoración tras la cita" desc="WhatsApp automático post-cita">
              <Toggle on={cfg.valoraciones} onChange={set('valoraciones')}/>
            </Row>
            <div style={{ height: 4 }}/>
          </Section>

          <Section title="Reservas y cancelaciones">
            <Row title="Cancelación online por el cliente" desc="El cliente puede cancelar desde el enlace">
              <Toggle on={cfg.cancelacion} onChange={set('cancelacion')}/>
            </Row>
            {cfg.cancelacion && (
              <SelectRow label="Permitir cancelar hasta" value={cfg.cancelacion_horas}
                onChange={v => setCfg(p => ({ ...p, cancelacion_horas: parseInt(v) }))}
                options={[
                  { value: 1,  label: '1 hora antes'   },
                  { value: 2,  label: '2 horas antes'  },
                  { value: 6,  label: '6 horas antes'  },
                  { value: 24, label: '24 horas antes' },
                ]}/>
            )}
            <Row title="Señal al reservar" desc="El cliente paga un anticipo para confirmar">
              <Toggle on={cfg.senal} onChange={set('senal')}/>
            </Row>
            {cfg.senal && (
              <div style={{ padding: '12px 0', borderBottom: '1px solid #EAF5EF' }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', marginBottom: 6 }}>Importe de la señal (EUR)</div>
                <input type="number" value={cfg.senal_importe}
                  onChange={e => setCfg(p => ({ ...p, senal_importe: parseFloat(e.target.value) }))}
                  style={{ ...inputStyle, fontFamily: 'DM Mono, monospace' }}/>
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
                onChange={v => setCfg(p => ({ ...p, retencion_semanas: parseInt(v) }))}
                options={[
                  { value: 3, label: '3 semanas sin visita' },
                  { value: 4, label: '4 semanas sin visita' },
                  { value: 6, label: '6 semanas sin visita' },
                  { value: 8, label: '8 semanas sin visita' },
                ]}/>
            )}
            <div style={{ height: 4 }}/>
          </Section>
        </div>

      </div>
    </div>
  );
}