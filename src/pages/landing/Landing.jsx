import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { emoji:'📅', titulo:'Reservas 24/7',        desc:'Tus clientes reservan desde el móvil. Sin llamadas, sin WhatsApps.' },
  { emoji:'💳', titulo:'TPV integrado',         desc:'Cobra en el mostrador. El stock se descuenta automáticamente.' },
  { emoji:'📦', titulo:'Stock con escáner',     desc:'Pistola de código de barras o cámara del móvil. Sin complicaciones.' },
  { emoji:'👥', titulo:'Gestión de clientes',   desc:'Historial completo, notas, filtros por edad y sexo.' },
  { emoji:'📊', titulo:'Estadísticas reales',   desc:'Facturación, top servicios, empleados más productivos.' },
  { emoji:'📅', titulo:'Google Calendar sync',  desc:'Tus reservas aparecen en tu calendario con un clic.' },
  { emoji:'🔔', titulo:'Alertas instantáneas',  desc:'Notificación push en el móvil cada vez que llega una reserva.' },
  { emoji:'📱', titulo:'Instálala como app',    desc:'PWA instalable en iOS y Android. Sin App Store.' },
];

const PASOS = [
  { num:'01', titulo:'Crea tu cuenta',        desc:'Registro en 30 segundos. Sin tarjeta.' },
  { num:'02', titulo:'Configura tu negocio',  desc:'Servicios, horarios y empleados en 5 minutos.' },
  { num:'03', titulo:'Comparte tu enlace',    desc:'Tus clientes reservan desde su móvil.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

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
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 28px; background:#0A9E6E; color:#fff;
          border:none; border-radius:12px; font-size:15px; font-weight:700;
          cursor:pointer; transition:all 0.2s; font-family:inherit;
          text-decoration:none;
        }
        .btn-primary:hover { background:#063D2A; transform:translateY(-2px); box-shadow:0 8px 24px rgba(10,158,110,0.3); }
        .btn-secondary {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 28px; background:transparent; color:#0B1E16;
          border:1.5px solid #D6EDE5; border-radius:12px; font-size:15px; font-weight:600;
          cursor:pointer; transition:all 0.2s; font-family:inherit;
          text-decoration:none;
        }
        .btn-secondary:hover { border-color:#0A9E6E; color:#0A9E6E; transform:translateY(-2px); }
        .feature-card {
          background:#F4FAF7; border:1px solid #EAF5EF; border-radius:16px;
          padding:28px 24px; transition:all 0.25s;
        }
        .feature-card:hover { background:#E8F7F2; border-color:#0A9E6E; transform:translateY(-4px); box-shadow:0 12px 32px rgba(10,158,110,0.12); }
        .nav-link { font-size:14px; font-weight:500; color:#6B9080; text-decoration:none; transition:color 0.15s; }
        .nav-link:hover { color:#0A9E6E; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.45s ease both; }
        .pill { display:inline-flex; align-items:center; gap:6px; background:#E8F7F2; border:1px solid #D6EDE5; border-radius:20px; padding:5px 14px; font-size:12.5px; font-weight:600; color:#063D2A; }
      `}</style>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background: scrollY > 20 ? 'rgba(255,255,255,0.97)' : 'transparent', backdropFilter:'blur(12px)', borderBottom: scrollY > 20 ? '1px solid #EAF5EF' : 'none', padding:'0 6vw', height:68, display:'flex', alignItems:'center', justifyContent:'space-between', transition:'all 0.3s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42" stroke="#0A9E6E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
            <circle cx="21" cy="32" r="2.2" fill="#fff"/>
          </svg>
          <span style={{ fontSize:19, fontWeight:800, color:'#063D2A', letterSpacing:-0.5 }}>Reservly</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:28 }}>
          <a href="#como-funciona" className="nav-link">Cómo funciona</a>
          <a href="#features" className="nav-link">Funciones</a>
          <a href="#precios" className="nav-link">Precios</a>
          <div style={{ display:'flex', gap:8, marginLeft:8 }}>
            <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding:'8px 18px', fontSize:13 }}>
              Entrar
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding:'8px 18px', fontSize:13 }}>
              Empezar gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{ minHeight:'92vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'80px 6vw 60px', background:'linear-gradient(180deg, #F4FAF7 0%, #fff 100%)', position:'relative', overflow:'hidden' }}>

        {/* Decoración fondo */}
        <div style={{ position:'absolute', top:-100, right:-150, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(10,158,110,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, left:-100, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,61,42,0.06) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <div className="fade-up" style={{ marginBottom:24 }}>
          <span className="pill">🚀 Ya disponible · Gratis durante el lanzamiento</span>
        </div>

        <h1 className="fade-up-2" style={{ fontSize:'clamp(36px, 5.5vw, 68px)', fontWeight:800, color:'#063D2A', lineHeight:1.1, letterSpacing:-2, marginBottom:24, maxWidth:820 }}>
          Tu negocio merece una agenda<br/>
          <span style={{ color:'#0A9E6E', position:'relative' }}>
            que trabaje por ti
            <svg style={{ position:'absolute', bottom:-8, left:0, width:'100%' }} viewBox="0 0 300 12" fill="none">
              <path d="M2 9C60 3 150 1 298 9" stroke="#0A9E6E" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
            </svg>
          </span>
        </h1>

        <p className="fade-up-3" style={{ fontSize:'clamp(16px, 2vw, 20px)', color:'#6B9080', maxWidth:580, margin:'0 auto 40px', lineHeight:1.7, fontWeight:400 }}>
          Reservas online, gestión de clientes, stock y cobros — todo en un panel limpio y rápido. Sin complicaciones.
        </p>

        <div className="fade-up-4" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:48 }}>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ fontSize:16, padding:'16px 32px' }}>
            Empieza gratis — sin tarjeta →
          </button>
          <button onClick={() => navigate('/demo')} className="btn-secondary" style={{ fontSize:16, padding:'16px 32px' }}>
            Ver demo en vivo
          </button>
        </div>

        {/* Stats */}
        <div className="fade-up-4" style={{ display:'flex', gap:'4vw', justifyContent:'center', flexWrap:'wrap' }}>
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
      <section style={{ background:'#063D2A', padding:'60px 6vw', overflow:'hidden' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ background:'#0A2E1F', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.4)' }}>
            {/* Barra de navegador falsa */}
            <div style={{ background:'#0B1E16', padding:'12px 16px', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#EF4444' }}/>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#F59E0B' }}/>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#22C55E' }}/>
              <div style={{ flex:1, background:'rgba(255,255,255,0.06)', borderRadius:6, padding:'4px 12px', marginLeft:8, fontSize:11.5, color:'rgba(255,255,255,0.3)', fontFamily:'DM Mono, monospace' }}>
                reservly.app/dashboard
              </div>
            </div>
            {/* Dashboard simulado */}
            <div style={{ display:'flex', minHeight:400 }}>
              {/* Sidebar mini */}
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
              {/* Contenido */}
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
                    { n:'Carmen López', s:'Corte y peinado', h:'09:00', c:'#0A9E6E' },
                    { n:'Ana Martínez', s:'Tinte', h:'10:30', c:'#3B82F6' },
                    { n:'Rosa Fernández', s:'Manicura', h:'12:00', c:'#F59E0B' },
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
      <section id="como-funciona" style={{ padding:'100px 6vw', background:'#fff' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>Cómo funciona</div>
          <h2 style={{ fontSize:'clamp(26px, 3.5vw, 42px)', fontWeight:800, color:'#063D2A', letterSpacing:-1, marginBottom:56 }}>
            Listo en menos de 10 minutos
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:32, position:'relative' }}>
            <div style={{ position:'absolute', top:40, left:'17%', right:'17%', height:2, background:'linear-gradient(90deg, #0A9E6E, #D6EDE5)', zIndex:0 }}/>
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
      <section id="features" style={{ padding:'100px 6vw', background:'#F4FAF7' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>Funciones</div>
            <h2 style={{ fontSize:'clamp(26px, 3.5vw, 42px)', fontWeight:800, color:'#063D2A', letterSpacing:-1, marginBottom:14 }}>
              Todo lo que necesitas, nada más
            </h2>
            <p style={{ fontSize:16, color:'#6B9080', maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>
              Sin apps de terceros. Sin integraciones complicadas. Todo en un panel.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{ fontSize:32, marginBottom:14 }}>{f.emoji}</div>
                <div style={{ fontSize:15, fontWeight:700, color:'#063D2A', marginBottom:8 }}>{f.titulo}</div>
                <div style={{ fontSize:13.5, color:'#6B9080', lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" style={{ padding:'100px 6vw', background:'#fff' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>Precios</div>
            <h2 style={{ fontSize:'clamp(26px, 3.5vw, 42px)', fontWeight:800, color:'#063D2A', letterSpacing:-1, marginBottom:14 }}>
              Simple y transparente
            </h2>
            <p style={{ fontSize:16, color:'#6B9080', lineHeight:1.7 }}>
              Gratis durante el lanzamiento. Sin letra pequeña.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Plan gratuito lanzamiento */}
            <div style={{ background:'#F4FAF7', border:'1px solid #EAF5EF', borderRadius:20, padding:'36px 32px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#6B9080', marginBottom:6, textTransform:'uppercase', letterSpacing:'1px' }}>Lanzamiento</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:8 }}>
                <span style={{ fontSize:52, fontWeight:800, color:'#063D2A', fontFamily:'DM Mono, monospace', lineHeight:1 }}>0€</span>
                <span style={{ fontSize:14, color:'#6B9080' }}>/mes ahora</span>
              </div>
              <div style={{ fontSize:13, color:'#0A9E6E', fontWeight:600, marginBottom:24 }}>Gratis mientras dure el lanzamiento</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                {['Reservas online ilimitadas','Gestión de clientes','TPV y stock','Google Calendar sync','Notificaciones push','PWA instalable','Hasta 3 empleados'].map((f, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13.5, color:'#0B1E16' }}>
                    <span style={{ color:'#0A9E6E', flexShrink:0, fontWeight:700 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/login')} className="btn-secondary" style={{ width:'100%', justifyContent:'center', fontSize:14 }}>
                Empezar gratis →
              </button>
            </div>
            {/* Plan pro futuro */}
            <div style={{ background:'#063D2A', border:'none', borderRadius:20, padding:'36px 32px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:16, right:16, background:'#0A9E6E', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>PRÓXIMAMENTE</div>
              <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:6, textTransform:'uppercase', letterSpacing:'1px' }}>Pro</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:8 }}>
                <span style={{ fontSize:52, fontWeight:800, color:'#fff', fontFamily:'DM Mono, monospace', lineHeight:1 }}>19€</span>
                <span style={{ fontSize:14, color:'rgba(255,255,255,0.5)' }}>/mes</span>
              </div>
              <div style={{ fontSize:13, color:'#0A9E6E', fontWeight:600, marginBottom:24 }}>Todo lo del plan gratuito, más:</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                {['Empleados ilimitados','Exportar Excel y PDF','Backup automático de datos','Bonos y descuentos','Comisiones automáticas','WhatsApp automático','Soporte prioritario'].map((f, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13.5, color:'rgba(255,255,255,0.75)' }}>
                    <span style={{ color:'#7FFFD4', flexShrink:0, fontWeight:700 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button disabled style={{ width:'100%', padding:'13px', background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:14, fontWeight:600, cursor:'not-allowed', fontFamily:'inherit' }}>
                Disponible pronto
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ background:'linear-gradient(135deg, #063D2A 0%, #0A4D2E 100%)', padding:'100px 6vw', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(10,158,110,0.15) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1, maxWidth:680, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(28px, 4vw, 48px)', fontWeight:800, color:'#fff', letterSpacing:-1.5, lineHeight:1.15, marginBottom:20 }}>
            Empieza hoy.<br/>
            <span style={{ color:'#7FFFD4' }}>Es gratis.</span>
          </h2>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.65)', marginBottom:40, lineHeight:1.7 }}>
            Configura en 5 minutos y comparte tu enlace de reservas. Tus clientes empezarán a reservar hoy mismo.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:24 }}>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ fontSize:16, padding:'16px 36px', background:'#0A9E6E' }}>
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
      <footer style={{ background:'#040F09', padding:'32px 6vw', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42" stroke="#0A9E6E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
            <circle cx="21" cy="32" r="2.2" fill="#040F09"/>
          </svg>
          <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>Reservly</span>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginLeft:6 }}>© 2026</span>
        </div>
        <div style={{ display:'flex', gap:24 }}>
          {['Privacidad','Términos','Contacto'].map(l => (
            <a key={l} href="#" style={{ fontSize:13, color:'rgba(255,255,255,0.35)', textDecoration:'none', transition:'color 0.15s' }}
              onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.8)'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.35)'}>
              {l}
            </a>
          ))}
        </div>
      </footer>

    </div>
  );
}