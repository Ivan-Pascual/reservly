import React from 'react';
import { useNavigate } from 'react-router-dom';

const PLANES = [
  {
    nombre: 'Básico',
    precio: 19,
    desc: 'Para autónomos y negocios pequeños.',
    color: '#063D2A',
    features: [
      'Reservas online ilimitadas',
      'Hasta 2 empleados',
      'TPV integrado',
      'Stock con escáner de código de barras',
      'Google Calendar sync',
      'Notificaciones push',
      'PWA instalable',
      'Backup de datos',
    ],
    noIncluye: [
      'WhatsApp automático',
      'Fidelización con sellos',
      'Widget embebible',
      'Reseñas verificadas',
      'Comisiones automáticas',
      'Bonos y descuentos',
    ],
  },
  {
    nombre: 'Pro',
    precio: 39,
    desc: 'Para negocios con equipo que quieren automatizar.',
    color: '#0A9E6E',
    popular: true,
    features: [
      'Todo lo del plan Básico',
      'Empleados ilimitados',
      'WhatsApp automático post-cita',
      'Fidelización con sellos digitales',
      'Widget embebible en tu web',
      'Perfil público con reseñas verificadas',
      'Comisiones automáticas por empleado',
      'Bonos y descuentos',
      'Exportar Excel y PDF',
    ],
    noIncluye: [
      'Multi-sede',
      'Factura electrónica',
      'API acceso',
    ],
  },
  {
    nombre: 'Agencia',
    precio: 79,
    desc: 'Para gestores que llevan varios negocios.',
    color: '#063D2A',
    features: [
      'Todo lo del plan Pro',
      'Multi-sede (hasta 5 locales)',
      'Factura electrónica (Ley Crea y Crece)',
      'Panel multi-negocio',
      'API acceso',
      'Soporte prioritario',
    ],
    noIncluye: [],
  },
];

const VS = [
  { feature: 'Precio real mensual',     reservly: '19–39€ fijo', booksy: '34.99€ + 30% ventas', fresha: 'Gratis + % ventas', eskedula: '~20€' },
  { feature: 'Sin marketplace',          reservly: '✓', booksy: '✗', fresha: '✗', eskedula: '✓' },
  { feature: 'Tu cliente es tuyo',       reservly: '✓', booksy: '✗', fresha: '✗', eskedula: '✓' },
  { feature: 'TPV + stock integrado',    reservly: '✓', booksy: 'básico', fresha: 'básico', eskedula: '✗' },
  { feature: 'Stock con escáner',        reservly: '✓', booksy: '✗', fresha: '✗', eskedula: '✗' },
  { feature: 'Fidelización integrada',   reservly: '✓', booksy: '✗', fresha: '✗', eskedula: '✗' },
  { feature: 'Widget embebible',         reservly: '✓', booksy: '✗', fresha: '✗', eskedula: '✗' },
  { feature: 'Google Calendar sync',     reservly: '✓', booksy: '✗', fresha: '✗', eskedula: '✗' },
  { feature: 'Reseñas verificadas',      reservly: '✓', booksy: '✓', fresha: '✓', eskedula: '✗' },
  { feature: 'Sin comisión por venta',   reservly: '✓', booksy: '✗', fresha: '✗', eskedula: '✓' },
  { feature: 'App instalable (PWA)',      reservly: '✓', booksy: '✓', fresha: '✓', eskedula: '✗' },
];

const FAQS = [
  {
    q: '¿Cuánto cuesta realmente Booksy?',
    a: 'Booksy cobra 34.99€/mes de base más hasta un 30% de comisión sobre tus ventas a través de su marketplace. Para un negocio que factura 3.000€/mes eso puede suponer más de 900€ al mes. Reservly cobra un precio fijo sin comisiones.'
  },
  {
    q: '¿Fresha es gratis de verdad?',
    a: 'Fresha es gratuito para reservas directas, pero cobra un porcentaje sobre las ventas que generas a través de su plataforma. Además, los clientes que reservan por Fresha son técnicamente clientes de Fresha, no tuyos. Con Reservly cada cliente es tuyo desde el primer día.'
  },
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí. Puedes subir o bajar de plan cuando quieras desde el panel de Ajustes. El cambio es inmediato y sin permanencia.'
  },
  {
    q: '¿Qué pasa con mis datos si cancelo?',
    a: 'Tus datos son tuyos. Si cancelas, puedes exportar todos tus clientes, reservas y estadísticas en Excel o PDF antes de que expire tu plan.'
  },
  {
    q: '¿Reservly cobra comisión por mis reservas?',
    a: 'Nunca. Reservly cobra una cuota fija mensual y cero comisiones. Da igual si tienes 10 reservas al mes o 1.000.'
  },
  {
    q: '¿Necesito instalar algo?',
    a: 'No. Reservly funciona en el navegador. Si quieres, puedes instalarlo como app en tu móvil con un clic (PWA), sin pasar por el App Store ni Google Play.'
  },
];

export default function Precios() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", color:'#0B1E16', background:'#fff', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        @media (max-width: 768px) {
          .planes-grid { grid-template-columns: 1fr !important; }
          .vs-table { font-size: 12px !important; }
          .vs-table th, .vs-table td { padding: 8px 6px !important; }
          .vs-col-hide { display: none !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 6vw', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42" stroke="#0A9E6E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
            <circle cx="21" cy="32" r="2.2" fill="#fff"/>
          </svg>
          <span style={{ fontSize:17, fontWeight:800, color:'#063D2A' }}>Reservly</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => navigate('/login')} style={{ padding:'8px 16px', background:'transparent', border:'1px solid #D6EDE5', borderRadius:8, fontSize:13, fontWeight:600, color:'#6B9080', cursor:'pointer' }}>
            Entrar
          </button>
          <button onClick={() => navigate('/login')} style={{ padding:'8px 16px', background:'#0A9E6E', border:'none', borderRadius:8, fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer' }}>
            Empezar gratis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background:'linear-gradient(180deg, #F4FAF7 0%, #fff 100%)', padding:'60px 6vw 48px', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:20, padding:'4px 14px', fontSize:12.5, fontWeight:600, color:'#063D2A', marginBottom:20 }}>
          🚀 30 días gratis · Sin tarjeta
        </div>
        <h1 style={{ fontSize:'clamp(28px, 5vw, 52px)', fontWeight:800, color:'#063D2A', letterSpacing:-1.5, lineHeight:1.1, marginBottom:16 }}>
          Precios simples.<br/>Sin sorpresas.
        </h1>
        <p style={{ fontSize:'clamp(15px, 2vw, 18px)', color:'#6B9080', maxWidth:520, margin:'0 auto 12px', lineHeight:1.7 }}>
          Sin comisiones por reserva. Sin marketplace que te robe los clientes. Un precio fijo y listo.
        </p>
        <p style={{ fontSize:13, color:'#A8C4B8' }}>
          Booksy cobra hasta 34.99€/mes + 30% de tus ventas. Nosotros no.
        </p>
      </section>

      {/* Planes */}
      <section style={{ padding:'0 6vw 60px' }}>
        <div className="planes-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, maxWidth:1000, margin:'0 auto' }}>
          {PLANES.map((p, i) => (
            <div key={i} style={{ background: p.popular ? '#063D2A' : '#F4FAF7', border: p.popular ? 'none' : '1px solid #EAF5EF', borderRadius:20, padding:'32px 28px', position:'relative', overflow:'hidden' }}>
              {p.popular && (
                <div style={{ position:'absolute', top:16, right:16, background:'#0A9E6E', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
                  MÁS POPULAR
                </div>
              )}
              <div style={{ fontSize:12, fontWeight:700, color: p.popular ? 'rgba(255,255,255,0.5)' : '#6B9080', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>
                {p.nombre}
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:6 }}>
                <span style={{ fontSize:48, fontWeight:800, color: p.popular ? '#fff' : '#063D2A', fontFamily:'DM Mono, monospace', lineHeight:1 }}>{p.precio}€</span>
                <span style={{ fontSize:13, color: p.popular ? 'rgba(255,255,255,0.5)' : '#6B9080' }}>/mes</span>
              </div>
              <div style={{ fontSize:13, color: p.popular ? 'rgba(255,255,255,0.6)' : '#6B9080', marginBottom:24, lineHeight:1.5 }}>{p.desc}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:28 }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color: p.popular ? 'rgba(255,255,255,0.85)' : '#0B1E16' }}>
                    <span style={{ color: p.popular ? '#7FFFD4' : '#0A9E6E', fontWeight:700, flexShrink:0, marginTop:1 }}>✓</span>{f}
                  </div>
                ))}
                {p.noIncluye.map((f, j) => (
                  <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color: p.popular ? 'rgba(255,255,255,0.3)' : '#A8C4B8' }}>
                    <span style={{ fontWeight:700, flexShrink:0, marginTop:1 }}>—</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/login')}
                style={{ width:'100%', padding:'13px', background: p.popular ? '#0A9E6E' : '#063D2A', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Empezar gratis →
              </button>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#A8C4B8' }}>
          30 días gratis en cualquier plan · Sin tarjeta · Sin permanencia · Cancela cuando quieras
        </div>
      </section>

      {/* Comparativa vs competencia */}
      <section style={{ padding:'60px 6vw', background:'#F4FAF7' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:12 }}>Comparativa</div>
            <h2 style={{ fontSize:'clamp(22px, 3vw, 36px)', fontWeight:800, color:'#063D2A', letterSpacing:-1, marginBottom:12 }}>
              ¿Por qué Reservly y no Booksy o Fresha?
            </h2>
            <p style={{ fontSize:15, color:'#6B9080', maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>
              Booksy y Fresha son marketplaces. Reservly es tu herramienta. La diferencia es quién es el dueño de tus clientes.
            </p>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="vs-table" style={{ width:'100%', borderCollapse:'collapse', fontSize:13.5, background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #EAF5EF' }}>
              <thead>
                <tr style={{ background:'#063D2A' }}>
                  <th style={{ padding:'14px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Función</th>
                  <th style={{ padding:'14px 16px', textAlign:'center', fontSize:13, fontWeight:700, color:'#7FFFD4' }}>Reservly</th>
                  <th className="vs-col-hide" style={{ padding:'14px 16px', textAlign:'center', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>Booksy</th>
                  <th className="vs-col-hide" style={{ padding:'14px 16px', textAlign:'center', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>Fresha</th>
                  <th className="vs-col-hide" style={{ padding:'14px 16px', textAlign:'center', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>Eskedula</th>
                </tr>
              </thead>
              <tbody>
                {VS.map((row, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid #EAF5EF', background: i%2===0 ? '#fff' : '#F4FAF7' }}>
                    <td style={{ padding:'12px 16px', color:'#6B9080', fontSize:13 }}>{row.feature}</td>
                    <td style={{ padding:'12px 16px', textAlign:'center', fontWeight:600, color: row.reservly==='✓' ? '#0A9E6E' : row.reservly==='✗' ? '#A8C4B8' : '#0B1E16', fontSize:13 }}>{row.reservly}</td>
                    <td className="vs-col-hide" style={{ padding:'12px 16px', textAlign:'center', color: row.booksy==='✓' ? '#0A9E6E' : row.booksy==='✗' ? '#A8C4B8' : '#6B9080', fontSize:13 }}>{row.booksy}</td>
                    <td className="vs-col-hide" style={{ padding:'12px 16px', textAlign:'center', color: row.fresha==='✓' ? '#0A9E6E' : row.fresha==='✗' ? '#A8C4B8' : '#6B9080', fontSize:13 }}>{row.fresha}</td>
                    <td className="vs-col-hide" style={{ padding:'12px 16px', textAlign:'center', color: row.eskedula==='✓' ? '#0A9E6E' : row.eskedula==='✗' ? '#A8C4B8' : '#6B9080', fontSize:13 }}>{row.eskedula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section style={{ padding:'60px 6vw', background:'#fff' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:12 }}>FAQ</div>
            <h2 style={{ fontSize:'clamp(22px, 3vw, 36px)', fontWeight:800, color:'#063D2A', letterSpacing:-1 }}>
              Preguntas frecuentes
            </h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a}/>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'linear-gradient(135deg, #063D2A 0%, #0A4D2E 100%)', padding:'60px 6vw', textAlign:'center' }}>
        <h2 style={{ fontSize:'clamp(24px, 4vw, 42px)', fontWeight:800, color:'#fff', letterSpacing:-1, marginBottom:16 }}>
          Empieza gratis hoy.<br/>
          <span style={{ color:'#7FFFD4' }}>Sin tarjeta.</span>
        </h2>
        <p style={{ fontSize:16, color:'rgba(255,255,255,0.65)', marginBottom:32, lineHeight:1.7 }}>
          30 días de prueba con acceso a todas las funciones. Sin compromiso.
        </p>
        <button onClick={() => navigate('/login')}
          style={{ padding:'16px 40px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:12, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          Crear mi cuenta gratis →
        </button>
        <div style={{ marginTop:16, fontSize:13, color:'rgba(255,255,255,0.35)' }}>
          Sin tarjeta · Sin permanencia · Cancela cuando quieras
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#040F09', padding:'24px 6vw', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42" stroke="#0A9E6E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
            <circle cx="21" cy="32" r="2.2" fill="#040F09"/>
          </svg>
          <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Reservly</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginLeft:4 }}>© 2026</span>
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {[['Privacidad','/privacidad'],['Términos','/terminos'],['hola@getreservly.com','mailto:hola@getreservly.com']].map(([label,href]) => (
            <a key={label} href={href} style={{ fontSize:12, color:'rgba(255,255,255,0.35)', textDecoration:'none' }}
              onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.8)'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.35)'}>
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ background:'#F4FAF7', border:'1px solid #EAF5EF', borderRadius:12, overflow:'hidden' }}>
      <div onClick={() => setOpen(!open)}
        style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', gap:12 }}>
        <span style={{ fontSize:14, fontWeight:600, color:'#0B1E16', lineHeight:1.4 }}>{q}</span>
        <span style={{ fontSize:18, color:'#0A9E6E', flexShrink:0, transition:'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </div>
      {open && (
        <div style={{ padding:'0 20px 16px', fontSize:13.5, color:'#6B9080', lineHeight:1.7 }}>{a}</div>
      )}
    </div>
  );
}