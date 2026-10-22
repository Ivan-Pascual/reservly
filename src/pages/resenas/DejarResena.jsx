import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabase';

export default function DejarResena() {
  const { slug, reservaId } = useParams();
  const [estado, setEstado] = useState('cargando'); // cargando | formulario | enviada | error | yaResena
  const [negocio, setNegocio] = useState(null);
  const [reserva, setReserva] = useState(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetchDatos();
  }, [reservaId, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDatos = async () => {
    // 1. Buscar negocio por slug
    const { data: neg } = await supabase
      .from('negocios_publicos').select('id, nombre, slug, direccion')
      .eq('slug', slug).single();

    if (!neg) { setEstado('error'); return; }
    setNegocio(neg);

    // 2. Buscar reserva con info del cliente y servicio
    const { data: res } = await supabase
      .from('reservas').select(`
        id, fecha, hora_inicio, estado,
        clientes(id, nombre),
        servicios(nombre),
        empleados(nombre)
      `).eq('id', reservaId).eq('negocio_id', neg.id).single();

    if (!res) { setEstado('error'); return; }
    if (res.estado !== 'completada') { setEstado('error'); return; }
    setReserva(res);

    // 3. Comprobar si ya dejó reseña
    const { data: resenaExistente } = await supabase
      .from('resenas').select('id')
      .eq('reserva_id', reservaId).single();

    if (resenaExistente) { setEstado('yaResena'); return; }

    setEstado('formulario');
  };

  const enviarResena = async () => {
    if (puntuacion === 0) return;
    setEnviando(true);
    try {
      await supabase.from('resenas').insert({
        negocio_id:  negocio.id,
        cliente_id:  reserva.clientes?.id || null,
        reserva_id:  reservaId,
        puntuacion,
        comentario:  comentario.trim() || null,
      });
      setEstado('enviada');
    } catch {
      setEstado('error');
    }
    setEnviando(false);
  };

  const Estrellas = ({ interactivo = false }) => (
    <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
      {[1,2,3,4,5].map(n => (
        <div key={n}
          onClick={() => interactivo && setPuntuacion(n)}
          onMouseEnter={() => interactivo && setHover(n)}
          onMouseLeave={() => interactivo && setHover(0)}
          style={{ fontSize: interactivo ? 44 : 32, cursor: interactivo ? 'pointer' : 'default', transition:'transform 0.1s', transform: interactivo && (hover||puntuacion) >= n ? 'scale(1.15)' : 'scale(1)' }}>
          {(interactivo ? (hover || puntuacion) : puntuacion) >= n ? '⭐' : '☆'}
        </div>
      ))}
    </div>
  );

  const LABELS = ['', 'Muy malo', 'Malo', 'Normal', 'Bueno', '¡Excelente!'];

  // ── Loading ──
  if (estado === 'cargando') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F4FAF7' }}>
      <div style={{ width:32, height:32, border:'3px solid #D6EDE5', borderTopColor:'#0A9E6E', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Error / reserva no válida ──
  if (estado === 'error') return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F4FAF7', padding:24, textAlign:'center' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>😔</div>
      <div style={{ fontSize:20, fontWeight:700, color:'#0B1E16', marginBottom:8 }}>Este enlace no es válido</div>
      <div style={{ fontSize:14, color:'#6B9080', lineHeight:1.7, maxWidth:360 }}>
        El enlace de reseña ha caducado, ya no está disponible o la cita no ha sido completada todavía.
      </div>
    </div>
  );

  // ── Ya dejó reseña ──
  if (estado === 'yaResena') return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F4FAF7', padding:24, textAlign:'center' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
      <div style={{ fontSize:20, fontWeight:700, color:'#0B1E16', marginBottom:8 }}>¡Ya dejaste tu reseña!</div>
      <div style={{ fontSize:14, color:'#6B9080', lineHeight:1.7, maxWidth:360 }}>
        Ya valoraste esta cita en <strong>{negocio?.nombre}</strong>. ¡Muchas gracias por tu opinión!
      </div>
    </div>
  );

  // ── Enviada con éxito ──
  if (estado === 'enviada') return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F4FAF7', padding:24, fontFamily:'DM Sans, system-ui, sans-serif' }}>
      <div style={{ background:'#fff', borderRadius:20, padding:'48px 32px', maxWidth:400, width:'100%', textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#063D2A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 20px', boxShadow:'0 0 0 8px #E8F7F2' }}>
          ✓
        </div>
        <div style={{ fontSize:22, fontWeight:800, color:'#0B1E16', marginBottom:8 }}>¡Gracias por tu reseña!</div>
        <div style={{ fontSize:14, color:'#6B9080', lineHeight:1.7, marginBottom:24 }}>
          Tu opinión ayuda a <strong>{negocio?.nombre}</strong> y a otros clientes a tomar mejores decisiones.
        </div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
          <Estrellas interactivo={false}/>
        </div>
        {comentario.trim() && (
          <div style={{ background:'#F4FAF7', borderRadius:10, padding:'12px 16px', fontSize:13.5, color:'#0B1E16', fontStyle:'italic', lineHeight:1.6 }}>
            "{comentario.trim()}"
          </div>
        )}
      </div>
      <div style={{ marginTop:20, fontSize:12, color:'#A8C4B8' }}>
        Reseña gestionada por <strong style={{ color:'#0A9E6E' }}>Reservly</strong>
      </div>
    </div>
  );

  // ── Formulario ──
  return (
    <div style={{ minHeight:'100vh', background:'#F4FAF7', fontFamily:'DM Sans, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background:'#063D2A', padding:'14px 20px', display:'flex', alignItems:'center', gap:8 }}>
        <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
          <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="21" cy="32" r="4.5" fill="white"/>
          <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
        </svg>
        <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>Reservly</span>
      </div>

      <div style={{ maxWidth:480, margin:'0 auto', padding:'32px 16px 48px' }}>

        {/* Card negocio */}
        <div style={{ background:'linear-gradient(135deg, #0A9E6E 0%, #063D2A 100%)', borderRadius:16, padding:'24px 20px', marginBottom:20, textAlign:'center' }}>
          <div style={{ width:56, height:56, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'#fff', margin:'0 auto 12px', border:'2px solid rgba(255,255,255,0.2)' }}>
            {negocio?.nombre?.[0]?.toUpperCase()}
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:4 }}>{negocio?.nombre}</div>
          {negocio?.direccion && (
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>📍 {negocio.direccion}</div>
          )}
        </div>

        {/* Resumen de la cita */}
        {reserva && (
          <div style={{ background:'#fff', borderRadius:14, padding:'16px 20px', marginBottom:20, border:'1px solid #EAF5EF' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>Tu cita</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { label:'Servicio',    val: reserva.servicios?.nombre },
                { label:'Profesional', val: reserva.empleados?.nombre },
                { label:'Fecha',       val: reserva.fecha },
                { label:'Hora',        val: reserva.hora_inicio?.slice(0,5) },
              ].filter(f => f.val).map(f => (
                <div key={f.label} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0', borderBottom:'1px solid #EAF5EF' }}>
                  <span style={{ color:'#6B9080' }}>{f.label}</span>
                  <span style={{ fontWeight:600, color:'#0B1E16' }}>{f.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario */}
        <div style={{ background:'#fff', borderRadius:16, padding:'28px 24px', border:'1px solid #EAF5EF', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:18, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>
              ¿Cómo fue tu experiencia?
            </div>
            <div style={{ fontSize:13.5, color:'#6B9080' }}>
              Tu opinión ayuda a mejorar el servicio
            </div>
          </div>

          {/* Estrellas */}
          <div style={{ marginBottom:12 }}>
            <Estrellas interactivo={true}/>
          </div>

          {/* Label puntuación */}
          <div style={{ textAlign:'center', marginBottom:24, minHeight:22 }}>
            {(hover || puntuacion) > 0 && (
              <span style={{ fontSize:14, fontWeight:600, color:'#0A9E6E' }}>
                {LABELS[hover || puntuacion]}
              </span>
            )}
          </div>

          {/* Comentario */}
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:8 }}>
              Comentario <span style={{ fontWeight:400, textTransform:'none' }}>(opcional)</span>
            </label>
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Cuéntanos tu experiencia. ¿Qué te gustó? ¿Qué mejorarías?"
              maxLength={500}
              style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #D6EDE5', borderRadius:10, fontSize:13.5, fontFamily:'DM Sans, sans-serif', outline:'none', minHeight:110, resize:'vertical', lineHeight:1.6 }}
              onFocus={e => e.target.style.borderColor='#0A9E6E'}
              onBlur={e => e.target.style.borderColor='#D6EDE5'}
            />
            <div style={{ textAlign:'right', fontSize:11, color:'#A8C4B8', marginTop:4 }}>
              {comentario.length}/500
            </div>
          </div>

          {/* Botón enviar */}
          <button
            onClick={enviarResena}
            disabled={puntuacion === 0 || enviando}
            style={{
              width:'100%', padding:'14px',
              background: puntuacion === 0 ? '#D6EDE5' : enviando ? '#A8C4B8' : '#0A9E6E',
              color: puntuacion === 0 ? '#A8C4B8' : '#fff',
              border:'none', borderRadius:10,
              fontSize:15, fontWeight:700,
              cursor: puntuacion === 0 || enviando ? 'not-allowed' : 'pointer',
              transition:'background 0.2s',
            }}>
            {enviando ? 'Enviando...' : puntuacion === 0 ? 'Selecciona una puntuación' : 'Enviar reseña →'}
          </button>

          <div style={{ textAlign:'center', fontSize:12, color:'#A8C4B8', marginTop:14, lineHeight:1.6 }}>
            Tu reseña es verificada — solo pueden valorar clientes que han tenido una cita real.
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:20, fontSize:12, color:'#A8C4B8' }}>
          Reseñas gestionadas por <strong style={{ color:'#0A9E6E' }}>Reservly</strong>
        </div>
      </div>
    </div>
  );
}