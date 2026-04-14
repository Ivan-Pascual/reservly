 import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section = ({ titulo, children }) => (
  <div style={{ marginBottom:32 }}>
    <h2 style={{ fontSize:18, fontWeight:700, color:'#0B1E16', marginBottom:12, paddingBottom:8, borderBottom:'1px solid #EAF5EF' }}>{titulo}</h2>
    <div style={{ fontSize:14, color:'#6B9080', lineHeight:1.8 }}>{children}</div>
  </div>
);

export default function Privacidad() {
  const navigate = useNavigate();
  const fecha = '13 de abril de 2026';

  return (
    <div style={{ fontFamily:'DM Sans, system-ui, sans-serif', background:'#fff', minHeight:'100vh' }}>

      {/* Nav */}
      <div style={{ background:'#063D2A', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="white"/>
            <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
          </svg>
          <span style={{ fontSize:16, fontWeight:700, color:'#fff' }}>Reservly</span>
        </div>
        <button onClick={() => navigate(-1)}
          style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.7)', padding:'6px 14px', borderRadius:8, fontSize:13, cursor:'pointer' }}>
          ← Volver
        </button>
      </div>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'48px 24px 80px' }}>

        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:10 }}>Legal</div>
          <h1 style={{ fontSize:'clamp(26px,4vw,36px)', fontWeight:800, color:'#0B1E16', marginBottom:12, letterSpacing:-0.5 }}>Política de privacidad</h1>
          <div style={{ fontSize:13, color:'#A8C4B8' }}>Última actualización: {fecha}</div>
        </div>

        <div style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:12, padding:'16px 20px', marginBottom:32, fontSize:13.5, color:'#063D2A', lineHeight:1.7 }}>
          En Reservly nos tomamos muy en serio la privacidad de los datos. Esta política explica qué datos recogemos, cómo los usamos y qué derechos tienes sobre ellos, en cumplimiento del Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales (LOPDGDD).
        </div>

        <Section titulo="1. Responsable del tratamiento">
          <p>El responsable del tratamiento de los datos personales recogidos a través de Reservly es:</p>
          <div style={{ background:'#F4FAF7', borderRadius:8, padding:'14px 16px', marginTop:12, fontSize:13.5 }}>
            <strong style={{ color:'#0B1E16' }}>Reservly</strong><br/>
            Email de contacto: <a href="mailto:privacidad@getreservly.com" style={{ color:'#0A9E6E' }}>privacidad@getreservly.com</a><br/>
            Web: <a href="https://getreservly.com" style={{ color:'#0A9E6E' }}>getreservly.com</a>
          </div>
        </Section>

        <Section titulo="2. Datos que recogemos">
          <p style={{ marginBottom:12 }}>Recogemos diferentes tipos de datos según el rol del usuario:</p>
          <p style={{ fontWeight:600, color:'#0B1E16', marginBottom:6 }}>Negocios (usuarios registrados)</p>
          <ul style={{ paddingLeft:20, marginBottom:16 }}>
            {['Nombre y apellidos del propietario','Email y contraseña (cifrada)','Nombre del negocio, dirección y teléfono','Datos de configuración del negocio','Datos de facturación (gestionados por Stripe)'].map(i => <li key={i} style={{ marginBottom:4 }}>{i}</li>)}
          </ul>
          <p style={{ fontWeight:600, color:'#0B1E16', marginBottom:6 }}>Clientes del negocio</p>
          <ul style={{ paddingLeft:20, marginBottom:16 }}>
            {['Nombre y apellidos','Teléfono y email','Historial de reservas','Notas y preferencias introducidas por el negocio','Fecha de nacimiento y sexo (opcionales)'].map(i => <li key={i} style={{ marginBottom:4 }}>{i}</li>)}
          </ul>
          <p style={{ fontWeight:600, color:'#0B1E16', marginBottom:6 }}>Datos técnicos</p>
          <ul style={{ paddingLeft:20 }}>
            {['Dirección IP','Tipo de navegador y dispositivo','Páginas visitadas y tiempo de sesión'].map(i => <li key={i} style={{ marginBottom:4 }}>{i}</li>)}
          </ul>
        </Section>

        <Section titulo="3. Finalidad del tratamiento">
          <p style={{ marginBottom:12 }}>Utilizamos los datos para las siguientes finalidades:</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { fin:'Prestación del servicio', desc:'Gestionar reservas, clientes, stock y cobros del negocio.' },
              { fin:'Comunicaciones transaccionales', desc:'Confirmaciones de reserva, recordatorios y notificaciones relacionadas con el servicio.' },
              { fin:'Facturación', desc:'Gestionar el cobro de las suscripciones a Reservly.' },
              { fin:'Mejora del servicio', desc:'Analizar el uso de la plataforma para mejorar la experiencia.' },
              { fin:'Cumplimiento legal', desc:'Conservar datos según las obligaciones fiscales y legales aplicables.' },
            ].map(f => (
              <div key={f.fin} style={{ background:'#F4FAF7', borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16', marginBottom:2 }}>{f.fin}</div>
                <div style={{ fontSize:13, color:'#6B9080' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section titulo="4. Base legal del tratamiento">
          <p style={{ marginBottom:12 }}>El tratamiento de datos se realiza bajo las siguientes bases legales:</p>
          <ul style={{ paddingLeft:20 }}>
            {[
              'Ejecución de un contrato — para prestar el servicio contratado por el negocio.',
              'Interés legítimo — para mejorar el servicio y prevenir el fraude.',
              'Obligación legal — para cumplir con las obligaciones fiscales y contables.',
              'Consentimiento — para el envío de comunicaciones de marketing (cuando aplique).',
            ].map(i => <li key={i} style={{ marginBottom:8 }}>{i}</li>)}
          </ul>
        </Section>

        <Section titulo="5. Conservación de los datos">
          <p>Los datos se conservan durante el tiempo necesario para la prestación del servicio y, tras la cancelación de la cuenta, durante el periodo mínimo exigido por la legislación aplicable (generalmente 5 años para datos fiscales).</p>
          <p style={{ marginTop:10 }}>Los datos de los clientes del negocio son responsabilidad del negocio como encargado del tratamiento. Reservly actúa como encargado del tratamiento en nombre del negocio.</p>
        </Section>

        <Section titulo="6. Transferencias internacionales">
          <p style={{ marginBottom:12 }}>Utilizamos los siguientes servicios de terceros que pueden implicar transferencias internacionales de datos:</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { proveedor:'Supabase', uso:'Base de datos y autenticación', pais:'UE / EEUU', garantia:'Cláusulas contractuales estándar' },
              { proveedor:'Vercel', uso:'Alojamiento de la aplicación', pais:'EEUU', garantia:'Cláusulas contractuales estándar' },
              { proveedor:'Resend', uso:'Envío de emails transaccionales', pais:'EEUU', garantia:'Cláusulas contractuales estándar' },
              { proveedor:'Stripe', uso:'Procesamiento de pagos', pais:'EEUU/UE', garantia:'Privacy Shield / Cláusulas contractuales' },
            ].map(t => (
              <div key={t.proveedor} style={{ display:'grid', gridTemplateColumns:'120px 1fr 80px', gap:10, padding:'10px 14px', background:'#F4FAF7', borderRadius:8, fontSize:13 }}>
                <div style={{ fontWeight:600, color:'#0B1E16' }}>{t.proveedor}</div>
                <div style={{ color:'#6B9080' }}>{t.uso}</div>
                <div style={{ color:'#A8C4B8', textAlign:'right' }}>{t.pais}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section titulo="7. Tus derechos">
          <p style={{ marginBottom:12 }}>Como titular de los datos tienes los siguientes derechos:</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:8 }}>
            {[
              { derecho:'Acceso', desc:'Conocer qué datos tenemos sobre ti.' },
              { derecho:'Rectificación', desc:'Corregir datos incorrectos o incompletos.' },
              { derecho:'Supresión', desc:'Solicitar la eliminación de tus datos.' },
              { derecho:'Portabilidad', desc:'Recibir tus datos en formato estructurado.' },
              { derecho:'Oposición', desc:'Oponerte al tratamiento en determinados casos.' },
              { derecho:'Limitación', desc:'Solicitar que limitemos el tratamiento.' },
            ].map(d => (
              <div key={d.derecho} style={{ background:'#F4FAF7', borderRadius:8, padding:'12px 14px' }}>
                <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16', marginBottom:3 }}>{d.derecho}</div>
                <div style={{ fontSize:12.5, color:'#6B9080' }}>{d.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop:16 }}>
            Para ejercer tus derechos escríbenos a <a href="mailto:privacidad@getreservly.com" style={{ color:'#0A9E6E', fontWeight:600 }}>privacidad@getreservly.com</a>. Tienes también derecho a presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color:'#0A9E6E', fontWeight:600 }}>Agencia Española de Protección de Datos (AEPD)</a>.
          </p>
        </Section>

        <Section titulo="8. Cookies">
          <p>Reservly utiliza únicamente cookies técnicas imprescindibles para el funcionamiento del servicio (sesión de usuario, preferencias). No utilizamos cookies de seguimiento ni publicidad de terceros.</p>
        </Section>

        <Section titulo="9. Seguridad">
          <p>Aplicamos medidas técnicas y organizativas adecuadas para proteger los datos frente a accesos no autorizados, pérdida o destrucción, incluyendo cifrado en tránsito (HTTPS/TLS), cifrado de contraseñas con bcrypt, y control de acceso por roles.</p>
        </Section>

        <Section titulo="10. Cambios en esta política">
          <p>Podemos actualizar esta política de privacidad periódicamente. Te notificaremos los cambios significativos por email. La fecha de la última actualización aparece siempre al inicio del documento.</p>
        </Section>

        <div style={{ background:'#063D2A', borderRadius:14, padding:'24px 28px', marginTop:40, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:4 }}>¿Tienes preguntas sobre privacidad?</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Estamos para ayudarte</div>
          </div>
          <a href="mailto:privacidad@getreservly.com"
            style={{ background:'#0A9E6E', color:'#fff', padding:'10px 20px', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>
            Contactar →
          </a>
        </div>

      </div>

      {/* Footer */}
      <div style={{ background:'#040F09', padding:'24px', textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.3)' }}>
        © 2026 Reservly · <a href="/terminos" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>Términos de uso</a> · <a href="/privacidad" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>Privacidad</a>
      </div>
    </div>
  );
}