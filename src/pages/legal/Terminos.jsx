import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section = ({ titulo, children }) => (
  <div style={{ marginBottom:32 }}>
    <h2 style={{ fontSize:18, fontWeight:700, color:'#0B1E16', marginBottom:12, paddingBottom:8, borderBottom:'1px solid #EAF5EF' }}>{titulo}</h2>
    <div style={{ fontSize:14, color:'#6B9080', lineHeight:1.8 }}>{children}</div>
  </div>
);

export default function Terminos() {
  const navigate = useNavigate();
  const fecha = '13 de abril de 2026';

  return (
    <div style={{ fontFamily:'DM Sans, system-ui, sans-serif', background:'#fff', minHeight:'100vh' }}>

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
          <h1 style={{ fontSize:'clamp(26px,4vw,36px)', fontWeight:800, color:'#0B1E16', marginBottom:12, letterSpacing:-0.5 }}>Términos de uso</h1>
          <div style={{ fontSize:13, color:'#A8C4B8' }}>Última actualización: {fecha}</div>
        </div>

        <Section titulo="1. Aceptación de los términos">
          <p>Al registrarte y usar Reservly aceptas estos términos de uso. Si no estás de acuerdo con alguno de ellos, no debes usar el servicio.</p>
        </Section>

        <Section titulo="2. Descripción del servicio">
          <p>Reservly es una plataforma SaaS de gestión de citas y reservas para negocios locales. Permite a los negocios gestionar su agenda, clientes, stock y cobros, y a sus clientes realizar reservas online.</p>
        </Section>

        <Section titulo="3. Registro y cuenta">
          <ul style={{ paddingLeft:20 }}>
            {[
              'Debes tener al menos 18 años para registrarte.',
              'Eres responsable de mantener la confidencialidad de tu contraseña.',
              'Debes proporcionar información veraz y actualizada.',
              'Una cuenta por negocio. No puedes ceder tu cuenta a terceros.',
              'Reservly se reserva el derecho a suspender cuentas que incumplan estos términos.',
            ].map(i => <li key={i} style={{ marginBottom:8 }}>{i}</li>)}
          </ul>
        </Section>

        <Section titulo="4. Precio y facturación">
          <p style={{ marginBottom:12 }}>Durante el periodo de lanzamiento, Reservly es gratuito. Cuando se activen los planes de pago:</p>
          <ul style={{ paddingLeft:20 }}>
            {[
              'El precio se factura mensualmente por adelantado.',
              'Puedes cancelar en cualquier momento. El acceso continúa hasta el final del periodo facturado.',
              'No realizamos reembolsos prorrateados salvo error nuestro.',
              'Nos reservamos el derecho a modificar los precios con 30 días de preaviso.',
            ].map(i => <li key={i} style={{ marginBottom:8 }}>{i}</li>)}
          </ul>
        </Section>

        <Section titulo="5. Uso aceptable">
          <p style={{ marginBottom:10 }}>Queda prohibido usar Reservly para:</p>
          <ul style={{ paddingLeft:20 }}>
            {[
              'Actividades ilegales o fraudulentas.',
              'Spam o comunicaciones no solicitadas.',
              'Intentar acceder a cuentas o datos de otros negocios.',
              'Sobrecargar o dañar la infraestructura del servicio.',
              'Revender o sublicenciar el acceso a Reservly.',
            ].map(i => <li key={i} style={{ marginBottom:8 }}>{i}</li>)}
          </ul>
        </Section>

        <Section titulo="6. Datos y privacidad">
          <p>El tratamiento de datos personales se rige por nuestra <a href="/privacidad" style={{ color:'#0A9E6E', fontWeight:600 }}>Política de Privacidad</a>. El negocio es responsable del tratamiento de los datos de sus clientes. Reservly actúa como encargado del tratamiento según el RGPD.</p>
        </Section>

        <Section titulo="7. Propiedad intelectual">
          <p>Todo el código, diseño, marca y contenido de Reservly son propiedad de Reservly. Se concede una licencia limitada, no exclusiva y no transferible para usar el servicio según estos términos.</p>
          <p style={{ marginTop:10 }}>Los datos introducidos por el negocio (clientes, reservas, etc.) son propiedad del negocio. Puedes exportarlos en cualquier momento desde Ajustes → Copia de seguridad.</p>
        </Section>

        <Section titulo="8. Disponibilidad y SLA">
          <p>Nos esforzamos por mantener Reservly disponible 24/7, pero no garantizamos una disponibilidad específica durante el periodo de lanzamiento. Notificaremos los mantenimientos planificados con antelación.</p>
        </Section>

        <Section titulo="9. Limitación de responsabilidad">
          <p>Reservly no será responsable de pérdidas de negocio, datos o ingresos derivadas del uso o imposibilidad de uso del servicio, salvo en casos de dolo o negligencia grave. La responsabilidad máxima de Reservly se limita al importe pagado en los últimos 3 meses.</p>
        </Section>

        <Section titulo="10. Modificación y cancelación">
          <p>Podemos modificar estos términos con 30 días de preaviso por email. El uso continuado del servicio tras ese plazo implica la aceptación de los nuevos términos.</p>
          <p style={{ marginTop:10 }}>Puedes cancelar tu cuenta en cualquier momento desde Ajustes. Tras la cancelación, tus datos se conservan 30 días antes de eliminarse definitivamente.</p>
        </Section>

        <Section titulo="11. Legislación aplicable">
          <p>Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Huesca, España, salvo que la ley aplicable establezca otro fuero.</p>
        </Section>

        <div style={{ background:'#063D2A', borderRadius:14, padding:'24px 28px', marginTop:40, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:4 }}>¿Dudas sobre los términos?</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Estamos para ayudarte</div>
          </div>
          <a href="mailto:hola@getreservly.com"
            style={{ background:'#0A9E6E', color:'#fff', padding:'10px 20px', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>
            Contactar →
          </a>
        </div>
      </div>

      <div style={{ background:'#040F09', padding:'24px', textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.3)' }}>
        © 2026 Reservly · <a href="/terminos" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>Términos de uso</a> · <a href="/privacidad" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>Privacidad</a>
      </div>
    </div>
  );
}