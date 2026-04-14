import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PagoCancelado() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:'100vh', background:'#F4FAF7', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'DM Sans, system-ui, sans-serif' }}>
      <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>

        <div style={{ width:90, height:90, borderRadius:'50%', background:'#FEF2F2', border:'2px solid #FECACA', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:40 }}>
          ✕
        </div>

        <h1 style={{ fontSize:'clamp(24px,4vw,36px)', fontWeight:800, color:'#0B1E16', marginBottom:12, letterSpacing:-0.5 }}>
          Pago cancelado
        </h1>
        <p style={{ fontSize:15, color:'#6B9080', lineHeight:1.7, marginBottom:32 }}>
          No se ha realizado ningún cargo. Puedes activar el plan cuando quieras desde Ajustes.
        </p>

        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:16, padding:'20px 24px', marginBottom:28, textAlign:'left' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16', marginBottom:12 }}>El plan gratuito incluye:</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              'Reservas online ilimitadas',
              'Gestión de clientes',
              'TPV y stock básico',
              'Google Calendar sync',
              'PWA instalable',
            ].map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13.5, color:'#6B9080' }}>
                <span style={{ color:'#0A9E6E', fontWeight:700 }}>✓</span>{f}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/ajustes')}
            style={{ padding:'13px 28px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            Activar plan →
          </button>
          <button onClick={() => navigate('/dashboard')}
            style={{ padding:'13px 24px', background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            Volver al inicio
          </button>
        </div>

        <div style={{ marginTop:20, fontSize:12, color:'#A8C4B8' }}>
          Sin permanencia · Activa el plan cuando quieras
        </div>
      </div>
    </div>
  );
}