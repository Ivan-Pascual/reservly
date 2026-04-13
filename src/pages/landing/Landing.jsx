import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    emoji: '📅',
    titulo: 'Reservas online 24/7',
    desc: 'Tus clientes reservan desde su móvil en cualquier momento. Sin llamadas, sin WhatsApps manuales.',
  },
  {
    emoji: '📦',
    titulo: 'Gestión de stock',
    desc: 'Controla tu inventario con pistola de código de barras. Descuento automático al cobrar.',
  },
  {
    emoji: '💳',
    titulo: 'TPV integrado',
    desc: 'Cobra en el mostrador con escáner de cámara o pistola. Registra cada venta automáticamente.',
  },
  {
    emoji: '📊',
    titulo: 'Estadísticas reales',
    desc: 'Facturación, top servicios, empleados más productivos. Todo en tiempo real.',
  },
  {
    emoji: '👥',
    titulo: 'Gestión de clientes',
    desc: 'Ficha completa con historial, notas, edad y preferencias. Filtros por sexo, edad y etiqueta.',
  },
  {
    emoji: '🔔',
    titulo: 'Notificaciones automáticas',
    desc: 'Email de confirmación al cliente, alertas push al negocio. Sin configuración extra.',
  },
  {
    emoji: '📱',
    titulo: 'PWA instalable',
    desc: 'Instálala en tu móvil como una app nativa. Sin App Store, sin Google Play.',
  },
  {
    emoji: '📅',
    titulo: 'Google Calendar sync',
    desc: 'Sincroniza tus reservas con Google Calendar en un clic.',
  },
];

const PRECIOS = [
  {
    nombre: 'Solo',
    precio: 19,
    desc: 'Para autónomos y negocios pequeños',
    features: [
      'Reservas online ilimitadas',
      'Hasta 2 empleados',
      'Gestión de clientes',
      'TPV y stock básico',
      'Notificaciones por email',
      'Google Calendar sync',
      'PWA instalable',
      'Soporte por email',
    ],
    cta: 'Empezar gratis',
    destacado: false,
  },
  {
    nombre: 'Equipo',
    precio: 39,
    desc: 'Para negocios con varios empleados',
    features: [
      'Todo lo del plan Solo',
      'Empleados ilimitados',
      'Comisiones automáticas',
      'Stock con pistola de barras',
      'Exportar a Excel y PDF',
      'Backup de datos',
      'Bonos y descuentos',
      'Soporte prioritario',
    ],
    cta: 'Empezar gratis',
    destacado: true,
  },
  {
    nombre: 'Pro',
    precio: 69,
    desc: 'Para cadenas y franquicias',
    features: [
      'Todo lo del plan Equipo',
      'Multi-sede',
      'API acceso',
      'Widget embebible',
      'WhatsApp automático',
      'Soporte dedicado',
      'Onboarding personalizado',
      'SLA garantizado',
    ],
    cta: 'Contactar',
    destacado: false,
  },
];

const TESTIMONIOS = [
  {
    nombre: 'Carmen López',
    negocio: 'Peluquería Carmen · Huesca',
    texto: 'Antes perdía el 30% de las citas por no coger el teléfono. Ahora mis clientes reservan solas y yo me entero al momento.',
    emoji: '💇‍♀️',
  },
  {
    nombre: 'Miguel Ángel',
    negocio: 'Barbería MG · Zaragoza',
    texto: 'El TPV con la pistola de códigos es una pasada. En 10 minutos cobro y el stock se actualiza solo.',
    emoji: '💈',
  },
  {
    nombre: 'Laura Pérez',
    negocio: 'Centro de estética · Madrid',
    texto: 'Mis clientas reservan a las 11 de la noche desde el sofá. Yo duermo tranquila y por la mañana tengo la agenda llena.',
    emoji: '💆‍♀️',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [emailCTA, setEmailCTA] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily:'DM Sans, system-ui, sans-serif', color:'#0B1E16', background:'#fff' }}>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(8px)', borderBottom:'1px solid #EAF5EF', padding:'0 5vw', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
              stroke="#0A9E6E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
            <circle cx="21" cy="32" r="2.2" fill="#fff"/>
          </svg>
          <span style={{ fontSize:18, fontWeight:700, color:'#063D2A' }}>Reservly</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:24 }}>
          <div style={{ display:'flex', gap:20 }}>
            {[
              { label:'Funciones',    href:'#features'    },
              { label:'Precios',      href:'#precios'     },
              { label:'Demo',         href:'#demo'        },
            ].map(l => (
              <a key={l.href} href={l.href}
                style={{ fontSize:14, fontWeight:500, color:'#6B9080', textDecoration:'none' }}
                onMouseEnter={e=>e.target.style.color='#0A9E6E'}
                onMouseLeave={e=>e.target.style.color='#6B9080'}>
                {l.label}
              </a>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => navigate('/login')}
              style={{ padding:'8px 16px', background:'transparent', border:'1px solid #D6EDE5', borderRadius:8, fontSize:13, fontWeight:600, color:'#6B9080', cursor:'pointer' }}>
              Iniciar sesión
            </button>
            <button onClick={() => navigate('/login')}
              style={{ padding:'8px 16px', background:'#0A9E6E', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>
              Empezar gratis →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg, #063D2A 0%, #0A9E6E 100%)', padding:'100px 5vw 80px', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:20, padding:'4px 14px', fontSize:12.5, fontWeight:600, color:'#fff', marginBottom:24 }}>
          🚀 Nuevo · Google Calendar sync · PWA instalable
        </div>
        <h1 style={{ fontSize:'clamp(32px, 5vw, 56px)', fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:20, maxWidth:760, margin:'0 auto 20px' }}>
          Las reservas de tu negocio,<br/>en piloto automático
        </h1>
        <p style={{ fontSize:'clamp(16px, 2vw, 20px)', color:'rgba(255,255,255,0.8)', maxWidth:560, margin:'0 auto 40px', lineHeight:1.6 }}>
          Reservly gestiona tus citas, clientes, stock y cobros. Tus clientes reservan online 24/7. Tú solo apareces a trabajar.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:48 }}>
          <button onClick={() => navigate('/login')}
            style={{ padding:'14px 28px', background:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, color:'#063D2A', cursor:'pointer' }}>
            Empieza gratis — 14 días sin tarjeta →
          </button>
          <button onClick={() => navigate('/demo')}
            style={{ padding:'14px 28px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:10, fontSize:15, fontWeight:600, color:'#fff', cursor:'pointer' }}>
            Ver demo en vivo
          </button>
        </div>
        <div style={{ display:'flex', gap:24, justifyContent:'center', flexWrap:'wrap' }}>
          {['Sin tarjeta de crédito', 'Configuración en 5 minutos', 'Cancela cuando quieras'].map(t => (
            <div key={t} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'rgba(255,255,255,0.7)' }}>
              <span style={{ color:'#7FFFD4' }}>✓</span> {t}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ background:'#F4FAF7', padding:'48px 5vw', display:'flex', justifyContent:'center', gap:'4vw', flexWrap:'wrap' }}>
        {[
          { valor:'24/7',   label:'Reservas online'          },
          { valor:'5 min',  label:'Para configurar'          },
          { valor:'0€',     label:'Para empezar'             },
          { valor:'100%',   label:'En la nube'               },
        ].map(s => (
          <div key={s.label} style={{ textAlign:'center' }}>
            <div style={{ fontSize:36, fontWeight:800, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>{s.valor}</div>
            <div style={{ fontSize:13, color:'#6B9080', marginTop:4, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" style={{ padding:'80px 5vw', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12 }}>Funcionalidades</div>
          <h2 style={{ fontSize:'clamp(24px, 3vw, 36px)', fontWeight:800, color:'#0B1E16', marginBottom:14 }}>Todo lo que necesita tu negocio</h2>
          <p style={{ fontSize:16, color:'#6B9080', maxWidth:520, margin:'0 auto' }}>De la reserva al cobro, pasando por el stock y los empleados. Sin apps de terceros, sin integraciones complicadas.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background:'#F4FAF7', border:'1px solid #EAF5EF', borderRadius:14, padding:'24px 22px' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='#E8F7F2'; e.currentTarget.style.borderColor='#0A9E6E'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='#F4FAF7'; e.currentTarget.style.borderColor='#EAF5EF'; }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{f.emoji}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>{f.titulo}</div>
              <div style={{ fontSize:13.5, color:'#6B9080', lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <section id="demo" style={{ background:'#063D2A', padding:'80px 5vw', textAlign:'center' }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12 }}>Demo en vivo</div>
        <h2 style={{ fontSize:'clamp(24px, 3vw, 36px)', fontWeight:800, color:'#fff', marginBottom:14 }}>Pruébalo sin registrarte</h2>
        <p style={{ fontSize:16, color:'rgba(255,255,255,0.7)', maxWidth:480, margin:'0 auto 32px', lineHeight:1.6 }}>
          Explora el panel completo con datos de ejemplo. Sin formularios, sin tarjeta.
        </p>
        <button onClick={() => navigate('/demo')}
          style={{ padding:'14px 32px', background:'#0A9E6E', border:'none', borderRadius:10, fontSize:15, fontWeight:700, color:'#fff', cursor:'pointer' }}>
          Abrir demo →
        </button>
      </section>

      {/* Testimonios */}
      <section style={{ padding:'80px 5vw', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12 }}>Testimonios</div>
          <h2 style={{ fontSize:'clamp(24px, 3vw, 36px)', fontWeight:800, color:'#0B1E16' }}>Negocios que ya confían en Reservly</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20 }}>
          {TESTIMONIOS.map((t, i) => (
            <div key={i} style={{ background:'#F4FAF7', border:'1px solid #EAF5EF', borderRadius:14, padding:'24px 22px' }}>
              <div style={{ fontSize:32, marginBottom:16 }}>{t.emoji}</div>
              <p style={{ fontSize:14, color:'#0B1E16', lineHeight:1.7, marginBottom:16, fontStyle:'italic' }}>"{t.texto}"</p>
              <div style={{ fontSize:13, fontWeight:700, color:'#063D2A' }}>{t.nombre}</div>
              <div style={{ fontSize:12, color:'#6B9080' }}>{t.negocio}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Precios */}
      <section id="precios" style={{ background:'#F4FAF7', padding:'80px 5vw' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12 }}>Precios</div>
          <h2 style={{ fontSize:'clamp(24px, 3vw, 36px)', fontWeight:800, color:'#0B1E16', marginBottom:14 }}>Simple y transparente</h2>
          <p style={{ fontSize:16, color:'#6B9080' }}>14 días gratis sin tarjeta. Sin permanencia. Cancela cuando quieras.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20, maxWidth:1000, margin:'0 auto' }}>
          {PRECIOS.map((p, i) => (
            <div key={i} style={{
              background: p.destacado ? '#063D2A' : '#fff',
              border: p.destacado ? 'none' : '1px solid #EAF5EF',
              borderRadius:16, padding:'32px 28px',
              position:'relative',
              transform: p.destacado ? 'scale(1.03)' : 'none',
              boxShadow: p.destacado ? '0 20px 60px rgba(6,61,42,0.3)' : 'none',
            }}>
              {p.destacado && (
                <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'#0A9E6E', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 14px', borderRadius:20, whiteSpace:'nowrap' }}>
                  MÁS POPULAR
                </div>
              )}
              <div style={{ fontSize:16, fontWeight:700, color: p.destacado ? '#fff' : '#0B1E16', marginBottom:6 }}>{p.nombre}</div>
              <div style={{ fontSize:12.5, color: p.destacado ? 'rgba(255,255,255,0.6)' : '#6B9080', marginBottom:20 }}>{p.desc}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:24 }}>
                <span style={{ fontSize:40, fontWeight:800, color: p.destacado ? '#fff' : '#0B1E16', fontFamily:'DM Mono, monospace' }}>{p.precio}</span>
                <span style={{ fontSize:14, color: p.destacado ? 'rgba(255,255,255,0.6)' : '#6B9080' }}>EUR/mes</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13.5, color: p.destacado ? 'rgba(255,255,255,0.85)' : '#0B1E16' }}>
                    <span style={{ color: p.destacado ? '#7FFFD4' : '#0A9E6E', flexShrink:0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/login')}
                style={{ width:'100%', padding:'12px', background: p.destacado ? '#0A9E6E' : '#063D2A', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
                {p.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding:'80px 5vw', textAlign:'center', maxWidth:700, margin:'0 auto' }}>
        <h2 style={{ fontSize:'clamp(24px, 3vw, 40px)', fontWeight:800, color:'#0B1E16', marginBottom:14, lineHeight:1.2 }}>
          Tu negocio merece una agenda que trabaje por ti
        </h2>
        <p style={{ fontSize:16, color:'#6B9080', marginBottom:36, lineHeight:1.6 }}>
          Únete a los negocios que ya gestionan sus reservas con Reservly. Configura en 5 minutos y empieza hoy.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:20 }}>
          <button onClick={() => navigate('/login')}
            style={{ padding:'14px 32px', background:'#0A9E6E', border:'none', borderRadius:10, fontSize:15, fontWeight:700, color:'#fff', cursor:'pointer' }}>
            Empieza gratis — 14 días →
          </button>
          <button onClick={() => navigate('/demo')}
            style={{ padding:'14px 24px', background:'transparent', border:'1px solid #D6EDE5', borderRadius:10, fontSize:15, fontWeight:600, color:'#6B9080', cursor:'pointer' }}>
            Ver demo
          </button>
        </div>
        <div style={{ fontSize:13, color:'#A8C4B8' }}>Sin tarjeta · Sin permanencia · Cancela cuando quieras</div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#063D2A', padding:'40px 5vw', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
              stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="white"/>
            <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
          </svg>
          <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Reservly</span>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginLeft:8 }}>© 2026</span>
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {['Privacidad','Términos','Contacto'].map(l => (
            <a key={l} href="#" style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none' }}
              onMouseEnter={e=>e.target.style.color='#fff'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.5)'}>
              {l}
            </a>
          ))}
        </div>
      </footer>

    </div>
  );
}