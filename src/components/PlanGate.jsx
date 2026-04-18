import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';

const FEATURE_INFO = {
  whatsapp:     { titulo:'WhatsApp automático',      desc:'Envía mensajes automáticos a tus clientes tras cada cita.' },
  fidelizacion: { titulo:'Fidelización con sellos',  desc:'Programa de sellos digitales para que tus clientes vuelvan.' },
  widget:       { titulo:'Widget embebible',         desc:'Una línea de código y tienes reservas en tu web.' },
  resenas:      { titulo:'Reseñas verificadas',      desc:'Perfil público con reseñas reales de clientes verificados.' },
  formularios:  { titulo:'Formulario de admisión',   desc:'Preguntas personalizadas por servicio antes de confirmar.' },
  comisiones:   { titulo:'Comisiones automáticas',   desc:'Calcula y registra comisiones por empleado en cada cobro.' },
  bonos:        { titulo:'Bonos y descuentos',       desc:'Crea bonos de sesiones y descuentos para fidelizar.' },
  exportar:     { titulo:'Exportar datos',           desc:'Descarga tus clientes y reservas en Excel o PDF.' },
  multiSede:    { titulo:'Multi-sede',               desc:'Gestiona hasta 5 locales desde un mismo panel.' },
  facturaElect: { titulo:'Factura electrónica',      desc:'Cumple con la Ley Crea y Crece con facturas electrónicas.' },
};

export default function PlanGate({ feature, children, planRequerido = 'pro' }) {
  const { puede, plan } = usePlan();
  const navigate = useNavigate();

  if (puede(feature)) return children;

  const planes = {
    pro:     { nombre:'Plan Pro',     precio:'39€/mes', color:'#0A9E6E', desde:'Básico' },
    agencia: { nombre:'Plan Agencia', precio:'79€/mes', color:'#063D2A', desde:'Pro'    },
  };
  const planInfo    = planes[planRequerido] || planes.pro;
  const featureInfo = FEATURE_INFO[feature] || { titulo:'Esta función', desc:'Está disponible en un plan superior.' };

  const PASOS = planRequerido === 'pro'
    ? ['Plan Básico (19€/mes)', '→ Plan Pro (39€/mes)']
    : ['Plan Pro (39€/mes)',    '→ Plan Agencia (79€/mes)'];

  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ maxWidth:440, textAlign:'center' }}>

        {/* Icono */}
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#EAF5EF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 20px' }}>
          🔒
        </div>

        {/* Título */}
        <div style={{ fontSize:11, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>
          {planInfo.nombre}
        </div>
        <h2 style={{ fontSize:20, fontWeight:800, color:'#0B1E16', marginBottom:8, letterSpacing:-0.3 }}>
          {featureInfo.titulo}
        </h2>
        <p style={{ fontSize:14, color:'#6B9080', lineHeight:1.7, marginBottom:20 }}>
          {featureInfo.desc}
        </p>

        {/* Tu plan actual */}
        <div style={{ background:'#F4FAF7', border:'1px solid #EAF5EF', borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:13, color:'#6B9080' }}>
          Tu plan actual: <strong style={{ color:'#0B1E16' }}>
  {plan === 'trial' ? 'Trial gratuito' :
   plan === 'solo'  ? 'Plan Solo' :
   plan === 'basico'? 'Plan Básico' :
   plan === 'pro'   ? 'Plan Pro' :
   plan === 'agencia'? 'Plan Agencia' : 'Trial gratuito'}
</strong></div>

        {/* Precio */}
        <div style={{ background:'#fff', border:`2px solid ${planInfo.color}`, borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>
            {planInfo.nombre}
          </div>
          <div style={{ fontSize:32, fontWeight:800, color: planInfo.color, fontFamily:'DM Mono, monospace', lineHeight:1 }}>
            {planInfo.precio}
          </div>
          <div style={{ fontSize:12, color:'#A8C4B8', marginTop:4 }}>sin permanencia · cancela cuando quieras</div>
        </div>

        {/* Qué incluye */}
        <div style={{ background:'#F4FAF7', borderRadius:10, padding:'12px 16px', marginBottom:20, textAlign:'left' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>
            Lo que desbloqueas
          </div>
          {Object.entries(FEATURE_INFO)
            .filter(([k]) => {
              if (planRequerido === 'pro') return ['whatsapp','fidelizacion','widget','resenas','formularios','comisiones','bonos','exportar'].includes(k);
              return ['multiSede','facturaElect'].includes(k);
            })
            .map(([k, info]) => (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0', fontSize:13, color: k === feature ? '#0B1E16' : '#6B9080', fontWeight: k === feature ? 700 : 400 }}>
                <span style={{ color: k === feature ? planInfo.color : '#A8C4B8', flexShrink:0 }}>
                  {k === feature ? '★' : '✓'}
                </span>
                {info.titulo}
                {k === feature && <span style={{ fontSize:11, background: planInfo.color + '20', color: planInfo.color, padding:'1px 6px', borderRadius:20, fontWeight:600 }}>esta función</span>}
              </div>
            ))
          }
        </div>

        <button onClick={() => navigate('/ajustes')}
          style={{ width:'100%', padding:'14px', background: planInfo.color, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
          Actualizar a {planInfo.nombre} →
        </button>
        <div style={{ fontSize:12, color:'#A8C4B8' }}>
          Pago seguro con Stripe · Sin permanencia
        </div>

      </div>
    </div>
  );
}