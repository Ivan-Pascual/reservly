import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { emoji:'📅', titulo:'Reservas 24/7',        desc:'Tus clientes reservan desde el móvil. Sin llamadas, sin WhatsApps.' },
  { emoji:'💳', titulo:'TPV integrado',         desc:'Cobra en el mostrador. El stock se descuenta automáticamente.' },
  { emoji:'📦', titulo:'Stock con escáner',     desc:'Pistola de código de barras o cámara del móvil. Sin complicaciones.' },
  { emoji:'👥', titulo:'Gestión de clientes',   desc:'Historial completo, notas, filtros por edad y sexo.' },
  { emoji:'📊', titulo:'Estadísticas reales',   desc:'Facturación, top servicios, empleados más productivos.' },
  { emoji:'🗓️', titulo:'Google Calendar sync',  desc:'Tus reservas aparecen en tu calendario con un clic.' },
  { emoji:'🔔', titulo:'Alertas instantáneas',  desc:'Notificación push en el móvil cada vez que llega una reserva.' },
  { emoji:'📱', titulo:'Instálala como app',    desc:'PWA instalable en iOS y Android. Sin App Store.' },
  { emoji:'🏅', titulo:'Fidelización',          desc:'Sellos digitales por visita. Tus clientes vuelven solos.' },
  { emoji:'🔗', titulo:'Widget embebible',      desc:'Una línea de código y tienes reservas en tu web.' },
  { emoji:'⭐', titulo:'Reseñas verificadas',   desc:'Perfil público con reseñas reales de clientes verificados.' },
  { emoji:'🎁', titulo:'Bonos y descuentos',    desc:'Crea bonos de sesiones y descuentos para fidelizar.' },
];

const PASOS = [
  { num:'01', titulo:'Crea tu cuenta',        desc:'Registro en 30 segundos. Sin tarjeta.' },
  { num:'02', titulo:'Configura tu negocio',  desc:'Servicios, horarios y empleados en 5 minutos.' },
  { num:'03', titulo:'Comparte tu enlace',    desc:'Tus clientes reservan desde su móvil.' },
];

const PLANES = [
  {
    nombre: 'Básico',
    precio: 19,
    desc: 'Para autónomos y negocios de una persona.',
    features: ['Reservas ilimitadas','Hasta 2 empleados','TPV y stock con escáner','Google Calendar sync','Notificaciones push','PWA instalable','Backup de datos'],
    dark: false,
  },
  {
    nombre: 'Pro',
    precio: 39,
    desc: 'Para negocios con equipo que quieren automatizar.',
    features: ['Todo lo del Básico','Empleados ilimitados','WhatsApp automático','Fidelización con sellos','Widget embebible','Perfil público + reseñas','Comisiones automáticas','Bonos y descuentos'],
    dark: true,
    popular: true,
  },
  {
    nombre: 'Agencia',
    precio: 79,
    desc: 'Para gestores que llevan varios negocios.',
    features: ['Todo lo del Pro','Multi-sede (5 locales)','Factura electrónica','Panel multi-negocio','API acceso','Soporte prioritario'],
    dark: false,
  },
];

const TESTIMONIOS = [
  {
    nombre: 'Carmen López',
    negocio: 'Peluquería Carmen — Zaragoza',
    texto: 'Antes perdía reservas porque no podía contestar el móvil mientras cortaba. Ahora mis clientes reservan solos y yo me entero al momento. Ha cambiado mi día a día.',
    avatar: 'CL',
    color: '#0A9E6E',
    estrellas: 5,
  },
  {
    nombre: 'Marcos Díaz',
    negocio: 'Centro de Fisioterapia Díaz — Huesca',
    texto: 'Llevaba años con una libreta de papel. Reservly me ha dado el control total de mis citas, mis clientes y mi facturación. Y lo más importante: no he perdido ni una cita desde que lo uso.',
    avatar: 'MD',
    color: '#3B82F6',
    estrellas: 5,
  },
  {
    nombre: 'Lucía Ferrer',
    negocio: 'Studio Nails Lucía — Barcelona',
    texto: 'Probé Booksy y me cobraba comisión por cada cliente que venía por su plataforma. Con Reservly pago 39€ al mes y mis clientes son míos. La diferencia es brutal.',
    avatar: 'LF',
    color: '#EC4899',
    estrellas: 5,
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", color:'#0B1E16', background:'#fff', overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior: smooth; }
        .btn-primary {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:14px 28px; background:#0A9E6E; color:#fff;
          border:none; border-radius:12px; font-size:15px; font-weight:700;
          cursor:pointer; transition:all 0.2s; font-family:inherit;
          text-decoration:none;
        }
        .btn-primary:hover { background:#063D2A; transform:translateY(-2px); box-shadow:0 8px 24px rgba(10,158,110,0.3); }
        .btn-secondary {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:14px 28px; background:transparent; color:#0B1E16;
          border:1.5px solid #D6EDE5; border-radius:12px; font-size:15px; font-weight:600;
          cursor:pointer; transition:all 0.2s; font-family:inherit;
          text-decoration:none;
        }
        .btn-secondary:hover { border-color:#0A9E6E; color:#0A9E6E; transform:translateY(-2px); }
        .feature-card {
          background:#F4FAF7; border:1px solid #EAF5EF; border-radius:16px;
          padding:24px 20px; transition:all 0.25s;
        }
        .feature-card:hover { background:#E8F7F2; border-color:#0A9E6E; transform:translateY(-4px); box-shadow:0 12px 32px rgba(10,158,110,0.12); }
        .nav-link { font-size:14px; font-weight:500; color:#6B9080; text-decoration:none; transition:color 0.15s; }
        .nav-link:hover { color:#0A9E6E; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fade-up  { animation: fadeUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.45s ease both; }
        .pill { display:inline-flex; align-items:center; gap:6px; background:#E8F7F2; border:1px solid #D6EDE5; border-radius:20px; padding:5px 14px; font-size:12.5px; font-weight:600; color:#063D2A; }
        .testimonio-card { background:#fff; border:1px solid #EAF5EF; border-radius:20px; padding:28px; transition:all 0.25s; }
        .testimonio-card:hover { border-color:#D6EDE5; box-shadow:0 8px 32px rgba(10,158,110,0.08); transform:translateY(-2px); }

        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .hero-btns { flex-direction: column !important; }
          .hero-btns button, .hero-btns a { width: 100% !important; }
          .pasos-grid { grid-template-columns: 1fr !important; }
          .pasos-linea { display: none !important; }
          .precios-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .dashboard-preview { display: none !important; }
          .cta-btns { flex-direction: column !important; }
          .cta-btns button { width: 100% !important; }
          .footer-inner { flex-direction: column !important; align-items: flex-start !important; }
          .testimonios-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background: scrollY > 20 ? 'rgba(255,255,255,0.97)' : 'transparent', backdropFilter:'blur(12px)', borderBottom: scrollY > 20 ? '1px solid #EAF5EF' : 'none', padding:'0 6vw', height:68, display:'flex', alignItems:'center', justifyContent:'space-between', transition:'all 0.3s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42" stroke="#0A9E6E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
            <circle cx="21" cy="32" r="2.2" fill="#fff"/>
          </svg>
          <span style={{ fontSize:18, fontWeight:800, color:'#063D2A', letterSpacing:-0.5 }}>Reservly</span>
        </div>

        {/* Desktop nav */}
        <div className="nav-desktop" style={{ display:'flex', alignItems:'center', gap:28 }}>
          <a href="#como-funciona" className="nav-link">Cómo funciona</a>
          <a href="#features" className="nav-link">Funciones</a>
          <a href="#precios" className="nav-link">Precios</a>
          <a href="/precios" className="nav-link">vs Booksy</a>
          <div style={{ display:'flex', gap:8, marginLeft:8 }}>
            <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding:'8px 18px', fontSize:13 }}>Entrar</button>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding:'8px 18px', fontSize:13 }}>Empezar gratis</button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="nav-mobile-btn" aria-label="Abrir menú" onClick={() => setMenuAbierto(!menuAbierto)}
          style={{ display:'none', background:'transparent', border:'none', cursor:'pointer', flexDirection:'column', gap:5, padding:8 }}>
          <div style={{ width:22, height:2, background:'#063D2A', borderRadius:2, transition:'all 0.2s', transform: menuAbierto ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}/>
          <div style={{ width:22, height:2, background:'#063D2A', borderRadius:2, transition:'all 0.2s', opacity: menuAbierto ? 0 : 1 }}/>
          <div style={{ width:22, height:2, background:'#063D2A', borderRadius:2, transition:'all 0.2s', transform: menuAbierto ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}/>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuAbierto && (
        <div style={{ position:'fixed', top:68, left:0, right:0, zIndex:99, background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'16px 24px', display:'flex', flexDirection:'column', gap:12, boxShadow:'0 8px 24px rgba(0,0,0,0.08)' }}>
          {[['#como-funciona','Cómo funciona'],['#features','Funciones'],['#precios','Precios'],['/precios','Comparativa vs Booksy']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuAbierto(false)}
              style={{ fontSize:15, fontWeight:600, color:'#0B1E16', textDecoration:'none', padding:'8px 0', borderBottom:'1px solid #EAF5EF' }}>
              {label}
            </a>
          ))}
          <button onClick={() => navigate('/login')} className="btn-secondary" style={{ width:'100%', marginTop:4 }}>Entrar</button>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ width:'100%' }}>Empezar gratis →</button>
        </div>
      )}

      {/* Hero */}
      <section style={{ minHeight:'92vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'80px 6vw 60px', background:'linear-gradient(180deg, #F4FAF7 0%, #fff 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-150, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(10,158,110,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, left:-100, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,61,42,0.06) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <div className="fade-up" style={{ marginBottom:24 }}>
          <span className="pill">🚀 Ya disponible · 30 días gratis sin tarjeta</span>
        </div>

        <h1 className="fade-up-2" style={{ fontSize:'clamp(32px, 5.5vw, 68px)', fontWeight:800, color:'#063D2A', lineHeight:1.1, letterSpacing:-2, marginBottom:24, maxWidth:820 }}>
          Tu negocio merece una agenda<br/>
          <span style={{ color:'#0A9E6E', position:'relative' }}>
            que trabaje por ti
            <svg style={{ position:'absolute', bottom:-8, left:0, width:'100%' }} viewBox="0 0 300 12" fill="none">
              <path d="M2 9C60 3 150 1 298 9" stroke="#0A9E6E" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
            </svg>
          </span>
        </h1>

        <p className="fade-up-3" style={{ fontSize:'clamp(15px, 2vw, 20px)', color:'#6B9080', maxWidth:560, margin:'0 auto 40px', lineHeight:1.7 }}>
          Reservas online, gestión de clientes, stock y cobros — todo en un panel limpio y rápido. Sin complicaciones.
        </p>

        <div className="fade-up-4 hero-btns" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:48, width:'100%', maxWidth:560 }}>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ fontSize:16, padding:'16px 32px', flex:1, minWidth:220 }}>
            Empieza gratis — sin tarjeta →
          </button>
          <button onClick={() => navigate('/demo')} className="btn-secondary" style={{ fontSize:16, padding:'16px 32px', flex:1, minWidth:160 }}>
            Ver demo en vivo
          </button>
        </div>

        <div className="fade-up-4" style={{ display:'flex', gap:'6vw', justifyContent:'center', flexWrap:'wrap' }}>
          {[
            { valor:'5 min', label:'para configurar' },
            { valor:'24/7',  label:'reservas online'  },
            { valor:'0€',    label:'para empezar'     },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>{s.valor}</div>
              <div style={{ fontSize:13, color:'#A8C4B8', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="dashboard-preview" style={{ background:'#063D2A', padding:'60px 6vw', overflow:'hidden' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ background:'#0A2E1F', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.4)' }}>
            <div style={{ background:'#0B1E16', padding:'12px 16px', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#EF4444' }}/>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#F59E0B' }}/>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#22C55E' }}/>
              <div style={{ flex:1, background:'rgba(255,255,255,0.06)', borderRadius:6, padding:'4px 12px', marginLeft:8, fontSize:11.5, color:'rgba(255,255,255,0.3)', fontFamily:'DM Mono, monospace' }}>
                getreservly.com/dashboard
              </div>
            </div>
            <div style={{ display:'flex', minHeight:400 }}>
              <div style={{ width:180, background:'#063D2A', padding:'20px 12px', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:24, padding:'0 8px' }}>
                  <div style={{ width:20, height:20, borderRadius:4, background:'#0A9E6E' }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Reservly</span>
                </div>
                {['⊞ Inicio','📅 Reservas','🗓️ Agenda','👤 Clientes','📦 Stock','⚙️ Ajustes'].map((item, i) => (
                  <div key={i} style={{ padding:'8px 10px', borderRadius:6, marginBottom:2, background: i===0 ? '#0A9E6E' : 'transparent', color: i===0 ? '#fff' : 'rgba(255,255,255,0.5)', fontSize:12, fontWeight: i===0 ? 600 : 400 }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ flex:1, padding:20, background:'#F4FAF7' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>Buenos días, Peluquería ✨</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
                  {[
                    { l:'Citas hoy', v:'4', dark:true },
                    { l:'Este mes', v:'32' },
                    { l:'Facturado', v:'840€' },
                    { l:'Clientes', v:'127' },
                  ].map(s => (
                    <div key={s.l} style={{ background: s.dark ? '#063D2A' : '#fff', border:'1px solid #EAF5EF', borderRadius:10, padding:'12px 14px' }}>
                      <div style={{ fontSize:10, color: s.dark ? 'rgba(255,255,255,0.5)' : '#6B9080', textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
                      <div style={{ fontSize:20, fontWeight:700, color: s.dark ? '#fff' : '#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#fff', borderRadius:10, padding:14, border:'1px solid #EAF5EF' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#0B1E16', marginBottom:10 }}>Agenda de hoy</div>
                  {[
                    { n:'Carmen López',   s:'Corte y peinado', h:'09:00', c:'#0A9E6E' },
                    { n:'Ana Martínez',   s:'Tinte',           h:'10:30', c:'#3B82F6' },
                    { n:'Rosa Fernández', s:'Manicura',         h:'12:00', c:'#F59E0B' },
                  ].map((r, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom: i<2?'1px solid #EAF5EF':'none' }}>
                      <div style={{ width:3, height:28, borderRadius:2, background:r.c, flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11.5, fontWeight:600, color:'#0B1E16' }}>{r.n}</div>
                        <div style={{ fontSize:10.5, color:'#6B9080' }}>{r.s}</div>
                      </div>
                      <div style={{ fontSize:11, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{r.h}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" style={{ padding:'80px 6vw', background:'#fff' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>Cómo funciona</div>
          <h2 style={{ fontSize:'clamp(24px, 3.5vw, 42px)', fontWeight:800, color:'#063D2A', letterSpacing:-1, marginBottom:48 }}>
            Listo en menos de 10 minutos
          </h2>
          <div className="pasos-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:32, position:'relative' }}>
            <div className="pasos-linea" style={{ position:'absolute', top:40, left:'17%', right:'17%', height:2, background:'linear-gradient(90deg, #0A9E6E, #D6EDE5)', zIndex:0 }}/>
            {PASOS.map((p, i) => (
              <div key={i} style={{ position:'relative', zIndex:1, textAlign:'center' }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background: i===0 ? '#063D2A' : i===1 ? '#0A9E6E' : '#E8F7F2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', border: i===2 ? '2px solid #D6EDE5' : 'none' }}>
                  <span style={{ fontSize:20, fontWeight:800, color: i===2 ? '#0A9E6E' : '#fff', fontFamily:'DM Mono, monospace' }}>{p.num}</span>
                </div>
                <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:8 }}>{p.titulo}</div>
                <div style={{ fontSize:13.5, color:'#6B9080', lineHeight:1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding:'80px 6vw', background:'#F4FAF7' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>Funciones</div>
            <h2 style={{ fontSize:'clamp(24px, 3.5vw, 42px)', fontWeight:800, color:'#063D2A', letterSpacing:-1, marginBottom:14 }}>
              Todo lo que necesitas, nada más
            </h2>
            <p style={{ fontSize:16, color:'#6B9080', maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>
              Sin apps de terceros. Sin integraciones complicadas. Todo en un panel.
            </p>
          </div>
          <div className="features-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{ fontSize:28, marginBottom:12 }}>{f.emoji}</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#063D2A', marginBottom:6 }}>{f.titulo}</div>
                <div style={{ fontSize:13, color:'#6B9080', lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section style={{ padding:'80px 6vw', background:'#fff' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>Testimonios</div>
            <h2 style={{ fontSize:'clamp(24px, 3.5vw, 42px)', fontWeight:800, color:'#063D2A', letterSpacing:-1, marginBottom:14 }}>
              Negocios que ya usan Reservly
            </h2>
            <p style={{ fontSize:16, color:'#6B9080', lineHeight:1.7 }}>
              Sin comisiones, sin marketplaces, sin letra pequeña.
            </p>
          </div>
          <div className="testimonios-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {TESTIMONIOS.map((t, i) => (
              <div key={i} className="testimonio-card">
                {/* Estrellas */}
                <div style={{ display:'flex', gap:3, marginBottom:16 }}>
                  {Array.from({ length: t.estrellas }).map((_, j) => (
                    <span key={j} style={{ color:'#F59E0B', fontSize:14 }}>★</span>
                  ))}
                </div>
                {/* Texto */}
                <p style={{ fontSize:14, color:'#0B1E16', lineHeight:1.7, marginBottom:20, fontStyle:'italic' }}>
                  "{t.texto}"
                </p>
                {/* Autor */}
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16' }}>{t.nombre}</div>
                    <div style={{ fontSize:12, color:'#6B9080' }}>{t.negocio}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" style={{ padding:'80px 6vw', background:'#F4FAF7' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>Precios</div>
            <h2 style={{ fontSize:'clamp(24px, 3.5vw, 42px)', fontWeight:800, color:'#063D2A', letterSpacing:-1, marginBottom:14 }}>
              Simple y transparente
            </h2>
            <p style={{ fontSize:16, color:'#6B9080', lineHeight:1.7 }}>
              30 días gratis sin tarjeta. Luego elige el plan que mejor se adapte.
            </p>
          </div>
          <div className="precios-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {PLANES.map((p, i) => (
              <div key={i} style={{ background: p.dark ? '#063D2A' : '#fff', border: p.dark ? 'none' : '1px solid #EAF5EF', borderRadius:20, padding:'32px 28px', position:'relative', overflow:'hidden' }}>
                {p.popular && (
                  <div style={{ position:'absolute', top:16, right:16, background:'#0A9E6E', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
                    POPULAR
                  </div>
                )}
                <div style={{ fontSize:12, fontWeight:700, color: p.dark ? 'rgba(255,255,255,0.5)' : '#6B9080', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>
                  {p.nombre}
                </div>
                <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:6 }}>
                  <span style={{ fontSize:46, fontWeight:800, color: p.dark ? '#fff' : '#063D2A', fontFamily:'DM Mono, monospace', lineHeight:1 }}>{p.precio}€</span>
                  <span style={{ fontSize:13, color: p.dark ? 'rgba(255,255,255,0.5)' : '#6B9080' }}>/mes</span>
                </div>
                <div style={{ fontSize:13, color: p.dark ? 'rgba(255,255,255,0.6)' : '#6B9080', marginBottom:20, lineHeight:1.5 }}>{p.desc}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color: p.dark ? 'rgba(255,255,255,0.8)' : '#0B1E16' }}>
                      <span style={{ color: p.dark ? '#7FFFD4' : '#0A9E6E', fontWeight:700, flexShrink:0, marginTop:1 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/login')}
                  style={{ width:'100%', padding:'12px', background: p.dark ? '#0A9E6E' : '#063D2A', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  Empezar gratis →
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:16 }}>
            <a href="/precios" style={{ fontSize:13, color:'#0A9E6E', fontWeight:600, textDecoration:'none' }}>
              Ver comparativa completa vs Booksy y Fresha →
            </a>
          </div>
          <div style={{ textAlign:'center', marginTop:10, fontSize:13, color:'#A8C4B8' }}>
            Sin permanencia · Cancela cuando quieras · Pago seguro con Stripe
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ background:'linear-gradient(135deg, #063D2A 0%, #0A4D2E 100%)', padding:'80px 6vw', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(10,158,110,0.15) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1, maxWidth:680, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(26px, 4vw, 48px)', fontWeight:800, color:'#fff', letterSpacing:-1.5, lineHeight:1.15, marginBottom:20 }}>
            Empieza hoy.<br/>
            <span style={{ color:'#7FFFD4' }}>30 días gratis.</span>
          </h2>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.65)', marginBottom:40, lineHeight:1.7 }}>
            Configura en 5 minutos y comparte tu enlace de reservas. Tus clientes empezarán a reservar hoy mismo.
          </p>
          <div className="cta-btns" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:24 }}>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ fontSize:16, padding:'16px 36px' }}>
              Crear mi cuenta gratis →
            </button>
            <button onClick={() => navigate('/demo')} className="btn-secondary" style={{ fontSize:16, padding:'16px 28px', color:'rgba(255,255,255,0.8)', borderColor:'rgba(255,255,255,0.2)' }}>
              Ver demo primero
            </button>
          </div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.35)' }}>Sin tarjeta · Sin permanencia · Sin letra pequeña</div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#040F09', padding:'32px 6vw' }}>
        <div className="footer-inner" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42" stroke="#0A9E6E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
              <circle cx="21" cy="32" r="2.2" fill="#040F09"/>
            </svg>
            <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>Reservly</span>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginLeft:6 }}>© 2026</span>
          </div>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            {[
              ['Privacidad','/privacidad'],
              ['Términos','/terminos'],
              ['Precios','/precios'],
              ['hola@getreservly.com','mailto:hola@getreservly.com'],
            ].map(([label, href]) => (
              <a key={label} href={href}
                style={{ fontSize:13, color:'rgba(255,255,255,0.35)', textDecoration:'none' }}
                onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.8)'}
                onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.35)'}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}