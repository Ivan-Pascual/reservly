import React from 'react';
import { useNavigate } from 'react-router-dom';

const PLANES = [
  {
    nombre: 'Básico',
    precio: 19,
    desc: 'Para autónomos y negocios de una persona.',
    features: [
      'Reservas ilimitadas',
      'Hasta 2 empleados',
      'TPV y stock con escáner',
      'Google Calendar sync',
      'Notificaciones push',
      'PWA instalable',
      'Backup de datos',
    ],
    color: '#063D2A',
    plan: 'basico',
  },
  {
    nombre: 'Pro',
    precio: 39,
    desc: 'Para negocios con equipo que quieren automatizar.',
    features: [
      'Todo lo del Básico',
      'Empleados ilimitados',
      'WhatsApp automático',
      'Fidelización con sellos',
      'Widget embebible',
      'Perfil público + reseñas',
      'Formulario de admisión',
      'Comisiones automáticas',
      'Bonos y descuentos',
      'Exportar Excel y PDF',
      'Estadísticas avanzadas',
    ],
    color: '#0A9E6E',
    plan: 'pro',
    destacado: true,
  },
  {
    nombre: 'Agencia',
    precio: 79,
    desc: 'Para gestores que llevan varios negocios.',
    features: [
      'Todo lo del Pro',
      'Multi-sede (5 locales)',
      'Factura electrónica',
      'Panel multi-negocio',
      'API acceso',
      'White label parcial',
      'Soporte prioritario',
    ],
    color: '#063D2A',
    plan: 'agencia',
  },
];

export default function PlanExpirado() {
  const navigate = useNavigate();

  const iniciarPago = async (plan) => {
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Error Stripe:', err);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F4FAF7', fontFamily:'DM Sans, system-ui, sans-serif', padding:'40px 16px' }}>

      <div style={{ maxWidth:960, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
                stroke="#0A9E6E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
              <circle cx="21" cy="32" r="2.2" fill="#F4FAF7"/>
            </svg>
            <span style={{ fontSize:22, fontWeight:800, color:'#063D2A' }}>Reservly</span>
          </div>
          <h1 style={{ fontSize:'clamp(24px,4vw,36px)', fontWeight:800, color:'#0B1E16', marginBottom:12, letterSpacing:-0.5 }}>
            Tu prueba gratuita ha terminado
          </h1>
          <p style={{ fontSize:16, color:'#6B9080', maxWidth:480, margin:'0 auto', lineHeight:1.7 }}>
            Elige el plan que mejor se adapta a tu negocio. Sin permanencia, cancela cuando quieras.
          </p>
        </div>

        {/* Planes */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16, marginBottom:40 }}>
          {PLANES.map(p => (
            <div key={p.plan} style={{
              background: p.destacado ? '#063D2A' : '#fff',
              border: p.destacado ? 'none' : '1px solid #EAF5EF',
              borderRadius:20, padding:'32px 28px',
              position:'relative', overflow:'hidden',
            }}>
              {p.destacado && (
                <div style={{ position:'absolute', top:16, right:16, background:'#0A9E6E', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
                  MÁS POPULAR
                </div>
              )}
              <div style={{ fontSize:13, fontWeight:700, color: p.destacado ? 'rgba(255,255,255,0.5)' : '#6B9080', textTransform:'uppercase', letterSpacing:'1px', marginBottom:6 }}>
                {p.nombre}
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:6 }}>
                <span style={{ fontSize:48, fontWeight:800, color: p.destacado ? '#fff' : '#063D2A', fontFamily:'DM Mono, monospace', lineHeight:1 }}>{p.precio}€</span>
                <span style={{ fontSize:14, color: p.destacado ? 'rgba(255,255,255,0.5)' : '#6B9080' }}>/mes</span>
              </div>
              <div style={{ fontSize:13, color: p.destacado ? 'rgba(255,255,255,0.6)' : '#6B9080', marginBottom:24, lineHeight:1.5 }}>{p.desc}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:28 }}>
                {p.features.map((f, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color: p.destacado ? 'rgba(255,255,255,0.8)' : '#0B1E16' }}>
                    <span style={{ color: p.destacado ? '#7FFFD4' : '#0A9E6E', fontWeight:700, flexShrink:0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={() => iniciarPago(p.plan)}
                style={{
                  width:'100%', padding:'14px',
                  background: p.destacado ? '#0A9E6E' : '#063D2A',
                  color:'#fff', border:'none', borderRadius:10,
                  fontSize:14, fontWeight:700, cursor:'pointer',
                }}>
                Elegir {p.nombre} →
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', fontSize:13, color:'#A8C4B8' }}>
          Sin permanencia · Cancela cuando quieras · Pago seguro con Stripe
        </div>
      </div>
    </div>
  );
}