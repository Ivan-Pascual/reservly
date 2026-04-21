import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COMPARACIONES = [
  {
    categoria: 'El modelo de negocio',
    items: [
      {
        aspecto: '¿De quién son tus clientes?',
        reservly: { valor: 'Tuyos siempre', desc: 'Cada cliente que reserva es tuyo. Sus datos, su historial, su contacto. Nadie más tiene acceso.', bueno: true },
        booksy:   { valor: 'De Booksy', desc: 'Booksy puede recomendar a tu cliente a tu competencia. Es su plataforma, tú eres un proveedor.', bueno: false },
        fresha:   { valor: 'De Fresha', desc: 'Igual que Booksy. Los clientes que entran por el marketplace no son tuyos realmente.', bueno: false },
      },
      {
        aspecto: '¿Cómo ganan dinero?',
        reservly: { valor: 'Cuota fija', desc: 'Pagamos lo mismo si tienes 10 o 1.000 reservas al mes. Sin sorpresas en la factura.', bueno: true },
        booksy:   { valor: 'Cuota + comisión', desc: '34.99€/mes de base más un porcentaje de tus ventas. Cuanto más ganas, más pagas.', bueno: false },
        fresha:   { valor: 'Comisión por venta', desc: 'El plan básico es gratis, pero cobran un porcentaje cada vez que alguien paga por su plataforma.', bueno: false },
      },
      {
        aspecto: '¿Puedes exportar tus datos?',
        reservly: { valor: 'Sí, cuando quieras', desc: 'Exporta clientes, reservas y estadísticas en Excel o PDF con un clic. Tus datos son tuyos.', bueno: true },
        booksy:   { valor: 'Limitado', desc: 'Tienes acceso a tus datos solo dentro de la plataforma. Salir es complicado.', bueno: false },
        fresha:   { valor: 'Limitado', desc: 'Mismo problema. Si decides irte, llevarte tus clientes no es fácil.', bueno: false },
      },
    ],
  },
  {
    categoria: 'Funcionalidades reales',
    items: [
      {
        aspecto: 'TPV integrado',
        reservly: { valor: '✓ Completo', desc: 'Cobra directamente desde la app, registra pagos, propinas y métodos. Sin hardware adicional.', bueno: true },
        booksy:   { valor: '~ Básico', desc: 'Tienen pagos pero muy orientados al marketplace. El TPV del día a día no es su foco.', bueno: null },
        fresha:   { valor: '~ Básico', desc: 'Similar. Integrado con su checkout, no tan flexible para uso diario en mostrador.', bueno: null },
      },
      {
        aspecto: 'Stock con escáner de código de barras',
        reservly: { valor: '✓ Incluido', desc: 'Gestiona productos con pistola de códigos de barras. Stock real, alertas de mínimos, historial.', bueno: true },
        booksy:   { valor: '✗ No existe', desc: 'No tienen módulo de stock. Tendrías que usar otra herramienta aparte.', bueno: false },
        fresha:   { valor: '✗ No existe', desc: 'Tampoco. Para un salón con productos es una carencia importante.', bueno: false },
      },
      {
        aspecto: 'Fidelización con sellos',
        reservly: { valor: '✓ Digital', desc: 'Tarjeta de sellos digitales integrada. El cliente acumula sellos y canjea premios automáticamente.', bueno: true },
        booksy:   { valor: '✗ No existe', desc: 'No tienen programa de fidelización. Tendrías que usar una app externa como Stamp Me.', bueno: false },
        fresha:   { valor: '✗ No existe', desc: 'Tampoco. Y para negocios de repetición como peluquerías, la fidelización es fundamental.', bueno: false },
      },
      {
        aspecto: 'Widget embebible en tu web',
        reservly: { valor: '✓ Una línea de código', desc: 'Pega un script en tu web y tus clientes reservan sin salir de ella. Compatible con Wix, WordPress, cualquier web.', bueno: true },
        booksy:   { valor: '✗ No existe', desc: 'Solo puedes poner un link a Booksy. No hay widget para tu web propia.', bueno: false },
        fresha:   { valor: '✗ No existe', desc: 'Igual. El botón de reservas lleva a Fresha, no a tu web.', bueno: false },
      },
      {
        aspecto: 'Google Calendar automático',
        reservly: { valor: '✓ Sincronización real', desc: 'Cada reserva aparece automáticamente en tu Google Calendar. Sin copiar manualmente nada.', bueno: true },
        booksy:   { valor: '✗ No existe', desc: 'No tienen sincronización con Google Calendar. Tienes que apuntar las citas tú mismo.', bueno: false },
        fresha:   { valor: '✗ No existe', desc: 'Tampoco. Para muchos profesionales esto es un punto de dolor real cada día.', bueno: false },
      },
    ],
  },
  {
    categoria: 'Experiencia del negocio',
    items: [
      {
        aspecto: 'Tiempo de configuración',
        reservly: { valor: '~15 minutos', desc: 'Onboarding guiado paso a paso. En 15 minutos tienes el perfil listo y puedes empezar a recibir reservas.', bueno: true },
        booksy:   { valor: '~1-2 horas', desc: 'Proceso más largo con validaciones, fotos, etc. Además necesitan revisar tu cuenta antes de activarla.', bueno: false },
        fresha:   { valor: '~30-60 min', desc: 'Más rápido que Booksy pero siguen requiriendo bastante configuración inicial.', bueno: null },
      },
      {
        aspecto: 'Instalable en el móvil',
        reservly: { valor: '✓ PWA sin App Store', desc: 'Se instala como app en tu móvil con un clic desde el navegador. Sin pasar por el App Store ni Google Play.', bueno: true },
        booksy:   { valor: '✓ App nativa', desc: 'Tienen app nativa para iOS y Android. Más completa pero ocupa más espacio.', bueno: true },
        fresha:   { valor: '✓ App nativa', desc: 'Igual que Booksy, app nativa disponible.', bueno: true },
      },
      {
        aspecto: 'Soporte en español',
        reservly: { valor: '✓ Email y chat', desc: 'Soporte en español. Y al ser un producto más pequeño, la respuesta es más directa y rápida.', bueno: true },
        booksy:   { valor: '~ Limitado', desc: 'Soporte en español pero muchas veces derivado a FAQs. Tiempo de respuesta variable.', bueno: null },
        fresha:   { valor: '~ Limitado', desc: 'Similar. El soporte en español existe pero no siempre es ágil.', bueno: null },
      },
    ],
  },
];

const CASOS = [
  {
    tipo: 'Peluquería con 2 estilistas',
    emoji: '💈',
    descripcion: 'Agenda por profesional, cobro en mostrador, productos de peluquería en stock.',
    reservly: 'Perfecto. Agenda por profesional, TPV integrado con stock y escáner, fidelización de clientes, WhatsApp automático post-cita.',
    booksy: 'Funcionaría para la agenda, pero sin TPV real para mostrador, sin stock, sin fidelización. Tendrías que pagar comisiones si llegan clientes por su marketplace.',
    ganador: 'reservly',
  },
  {
    tipo: 'Centro de estética pequeño',
    emoji: '✨',
    descripcion: 'Una sola esteticista, reservas online, clientes habituales.',
    reservly: 'Ideal. Plan Simple a 19€/mes con reservas ilimitadas, sin comisiones, página pública con reseñas verificadas.',
    booksy: 'Fresha gratuito puede ser suficiente si solo necesitas agenda básica. Pero si quieres fidelización o TPV, tendrás que pagar.',
    ganador: 'depende',
  },
  {
    tipo: 'Clínica de fisioterapia',
    emoji: '🏥',
    descripcion: 'Varios fisioterapeutas, formularios de admisión, historial de cliente.',
    reservly: 'Perfecto. Formulario de admisión por servicio, agenda por profesional, ficha de cliente con historial completo.',
    booksy: 'No tienen formularios de admisión personalizados por servicio. La ficha de cliente es muy básica.',
    ganador: 'reservly',
  },
  {
    tipo: 'Barbería con clientela fija',
    emoji: '✂️',
    descripcion: 'Reservas recurrentes, clientes de siempre, quiere fidelizarlos.',
    reservly: 'La fidelización con sellos digitales es exactamente para esto. Además, el widget en su web o Instagram permite reservar sin salir.',
    booksy: 'Sin fidelización. Los clientes habituales no tienen incentivo extra para volver por Booksy.',
    ganador: 'reservly',
  },
];

function ComparacionCard({ item }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, overflow:'hidden', marginBottom:10 }}>
      <div onClick={() => setAbierto(!abierto)}
        style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', gap:12 }}
        onMouseEnter={e => e.currentTarget.style.background='#F4FAF7'}
        onMouseLeave={e => e.currentTarget.style.background='#fff'}
      >
        <span style={{ fontSize:14, fontWeight:600, color:'#0B1E16' }}>{item.aspecto}</span>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <span style={{ fontSize:12, fontWeight:700, color: item.reservly.bueno ? '#0A9E6E' : '#A8C4B8', background: item.reservly.bueno ? '#E8F7F2' : '#F4FAF7', padding:'3px 10px', borderRadius:20 }}>
            {item.reservly.valor}
          </span>
          <span style={{ fontSize:16, color:'#A8C4B8', transition:'transform 0.2s', display:'inline-block', transform: abierto ? 'rotate(180deg)' : 'none' }}>▾</span>
        </div>
      </div>
      {abierto && (
        <div style={{ borderTop:'1px solid #EAF5EF' }}>
          {[
            { nombre:'Reservly', data: item.reservly, color:'#0A9E6E', bg:'#E8F7F2' },
            { nombre:'Booksy',   data: item.booksy,   color:'#6B9080', bg:'#F4FAF7' },
            { nombre:'Fresha',   data: item.fresha,   color:'#6B9080', bg:'#F4FAF7' },
          ].map(({ nombre, data, color, bg }) => (
            <div key={nombre} style={{ padding:'14px 18px', borderBottom:'1px solid #EAF5EF', background: bg, display:'flex', gap:14 }}>
              <div style={{ width:70, fontSize:12, fontWeight:700, color, flexShrink:0, paddingTop:2 }}>{nombre}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16', marginBottom:3 }}>{data.valor}</div>
                <div style={{ fontSize:12.5, color:'#6B9080', lineHeight:1.6 }}>{data.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Comparativa() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", color:'#0B1E16', background:'#fff', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
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
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span onClick={() => navigate('/precios')} style={{ fontSize:13, color:'#6B9080', cursor:'pointer', fontWeight:500 }}>Ver precios →</span>
          <button onClick={() => navigate('/login')} style={{ padding:'8px 16px', background:'#0A9E6E', border:'none', borderRadius:8, fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer' }}>
            Empezar gratis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background:'linear-gradient(180deg, #F4FAF7 0%, #fff 100%)', padding:'60px 6vw 48px', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:20, padding:'4px 14px', fontSize:12.5, fontWeight:600, color:'#92400E', marginBottom:20 }}>
          ⚡ Reservly vs Booksy vs Fresha
        </div>
        <h1 style={{ fontSize:'clamp(28px, 5vw, 52px)', fontWeight:800, color:'#063D2A', letterSpacing:-1.5, lineHeight:1.1, marginBottom:16 }}>
          ¿Por qué cambiar<br/>a Reservly?
        </h1>
        <p style={{ fontSize:'clamp(15px, 2vw, 18px)', color:'#6B9080', maxWidth:540, margin:'0 auto 32px', lineHeight:1.7 }}>
          Booksy y Fresha son marketplaces que te usan como proveedor. Reservly es una herramienta que trabaja para ti. La diferencia importa.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/login')}
            style={{ padding:'13px 28px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            Probar gratis 30 días →
          </button>
          <button onClick={() => navigate('/precios')}
            style={{ padding:'13px 28px', background:'transparent', color:'#063D2A', border:'1.5px solid #D6EDE5', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            Ver precios
          </button>
        </div>
      </section>

      {/* El argumento principal */}
      <section style={{ padding:'48px 6vw', background:'#063D2A' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:20 }}>
          {[
            { emoji:'🏪', titulo:'Tu negocio, tus clientes', desc:'En Booksy y Fresha, los clientes son de la plataforma. Pueden recomendarte a tu competencia. En Reservly, cada cliente es tuyo para siempre.' },
            { emoji:'💶', titulo:'Sin comisiones por venta', desc:'Booksy cobra hasta 34.99€/mes más comisión. Fresha cobra % por cada cobro. Reservly cobra un precio fijo sin importar cuánto factures.' },
            { emoji:'🔧', titulo:'Más funciones, mismo precio', desc:'TPV integrado, stock con escáner, fidelización, Google Calendar, widget para tu web. Todo incluido. Sin módulos de pago extra.' },
          ].map(item => (
            <div key={item.titulo} style={{ textAlign:'center', padding:'8px' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>{item.emoji}</div>
              <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:8 }}>{item.titulo}</div>
              <div style={{ fontSize:13.5, color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparativa detallada por categorías */}
      <section style={{ padding:'60px 6vw', background:'#fff' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:12 }}>Comparativa detallada</div>
            <h2 style={{ fontSize:'clamp(22px, 3vw, 36px)', fontWeight:800, color:'#063D2A', letterSpacing:-1, marginBottom:12 }}>
              Función por función
            </h2>
            <p style={{ fontSize:14, color:'#6B9080', lineHeight:1.7 }}>
              Haz clic en cada punto para ver la explicación completa.
            </p>
          </div>

          {COMPARACIONES.map((cat, i) => (
            <div key={i} style={{ marginBottom:32 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ height:1, flex:1, background:'#EAF5EF' }}/>
                {cat.categoria}
                <div style={{ height:1, flex:1, background:'#EAF5EF' }}/>
              </div>
              {cat.items.map((item, j) => (
                <ComparacionCard key={j} item={item}/>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Casos de uso — ¿cuál te conviene? */}
      <section style={{ padding:'60px 6vw', background:'#F4FAF7' }}>
        <div style={{ maxWidth:860, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:12 }}>Casos de uso</div>
            <h2 style={{ fontSize:'clamp(22px, 3vw, 36px)', fontWeight:800, color:'#063D2A', letterSpacing:-1, marginBottom:12 }}>
              ¿Reservly es para ti?
            </h2>
            <p style={{ fontSize:14, color:'#6B9080', lineHeight:1.7, maxWidth:480, margin:'0 auto' }}>
              Siendo honestos — Reservly no es para todo el mundo. Esto te ayuda a decidir.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(380px, 1fr))', gap:16 }}>
            {CASOS.map((caso, i) => (
              <div key={i} style={{ background:'#fff', border:`2px solid ${caso.ganador==='reservly' ? '#0A9E6E' : '#EAF5EF'}`, borderRadius:16, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', background: caso.ganador==='reservly' ? '#E8F7F2' : '#F4FAF7', borderBottom:'1px solid #EAF5EF', display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:24 }}>{caso.emoji}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>{caso.tipo}</div>
                    <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>{caso.descripcion}</div>
                  </div>
                  {caso.ganador === 'reservly' && (
                    <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, background:'#0A9E6E', color:'#fff', padding:'3px 8px', borderRadius:20, flexShrink:0 }}>
                      ✓ Recomendado
                    </span>
                  )}
                </div>
                <div style={{ padding:'16px 20px' }}>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5 }}>Con Reservly</div>
                    <div style={{ fontSize:13, color:'#0B1E16', lineHeight:1.6 }}>{caso.reservly}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5 }}>Con Booksy/Fresha</div>
                    <div style={{ fontSize:13, color:'#6B9080', lineHeight:1.6 }}>{caso.booksy}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cuándo NO usar Reservly */}
          <div style={{ marginTop:24, background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:14, padding:'20px 24px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#92400E', marginBottom:10 }}>⚠️ Cuándo Reservly puede NO ser la mejor opción</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                'Si necesitas visibilidad a nuevos clientes a través de un marketplace — Booksy y Fresha tienen tráfico de búsqueda propio que Reservly no tiene.',
                'Si solo necesitas agenda básica gratuita — Fresha es gratis y cumple para casos muy simples.',
                'Si necesitas app nativa muy pulida para el cliente final — Booksy y Fresha tienen apps más maduras.',
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:'#92400E', lineHeight:1.5 }}>
                  <span style={{ flexShrink:0 }}>—</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'linear-gradient(135deg, #063D2A 0%, #0A4D2E 100%)', padding:'60px 6vw', textAlign:'center' }}>
        <h2 style={{ fontSize:'clamp(24px, 4vw, 42px)', fontWeight:800, color:'#fff', letterSpacing:-1, marginBottom:16 }}>
          Pruébalo 30 días gratis.<br/>
          <span style={{ color:'#7FFFD4' }}>Sin tarjeta.</span>
        </h2>
        <p style={{ fontSize:16, color:'rgba(255,255,255,0.65)', marginBottom:32, lineHeight:1.7 }}>
          Si en 30 días no ves la diferencia, no te cobramos nada. Sin preguntas.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/login')}
            style={{ padding:'16px 40px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:12, fontSize:16, fontWeight:700, cursor:'pointer' }}>
            Crear mi cuenta gratis →
          </button>
          <button onClick={() => navigate('/precios')}
            style={{ padding:'16px 28px', background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            Ver precios
          </button>
        </div>
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
          {[['Precios','/precios'],['Privacidad','/privacidad'],['Términos','/terminos']].map(([label,href]) => (
            <span key={label} onClick={() => navigate(href)}
              style={{ fontSize:12, color:'rgba(255,255,255,0.35)', cursor:'pointer' }}
              onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.8)'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.35)'}>
              {label}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}