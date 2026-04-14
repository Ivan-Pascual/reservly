import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';

export default function PagoExito() {
  const navigate = useNavigate();
  const { negocio } = useNegocio();

  useEffect(() => {
    // Actualizar plan en Supabase
    const actualizarPlan = async () => {
      if (!negocio) return;
      await supabase.from('negocios').update({ plan: 'solo' }).eq('id', negocio.id);
    };
    actualizarPlan();
  }, [negocio]);

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #063D2A 0%, #0A4D2E 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'DM Sans, system-ui, sans-serif' }}>
      <div style={{ maxWidth:520, width:'100%', textAlign:'center' }}>

        {/* Icono animado */}
        <div style={{ width:100, height:100, borderRadius:'50%', background:'rgba(10,158,110,0.2)', border:'2px solid rgba(10,158,110,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', fontSize:48 }}>
          ✓
        </div>

        <h1 style={{ fontSize:'clamp(28px,5vw,42px)', fontWeight:800, color:'#fff', marginBottom:12, letterSpacing:-1 }}>
          ¡Bienvenido al Plan Solo!
        </h1>
        <p style={{ fontSize:16, color:'rgba(255,255,255,0.7)', lineHeight:1.7, marginBottom:36 }}>
          Tu suscripción está activa. Ya puedes usar todas las funciones de Reservly sin límites.
        </p>

        {/* Features desbloqueadas */}
        <div style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:'24px 28px', marginBottom:32, textAlign:'left' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:16 }}>
            Funciones activas
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              'Reservas online ilimitadas',
              'Gestión de clientes',
              'TPV y stock',
              'Google Calendar sync',
              'Notificaciones push',
              'PWA instalable',
              'Hasta 3 empleados',
              'Soporte por email',
            ].map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgba(255,255,255,0.8)' }}>
                <span style={{ color:'#7FFFD4', fontWeight:700, flexShrink:0 }}>✓</span>{f}
              </div>
            ))}
          </div>
        </div>

        {/* Facturación */}
        <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'16px 20px', marginBottom:32, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:2 }}>Plan activo</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Reservly Plan Solo</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:2 }}>Facturación</div>
            <div style={{ fontSize:22, fontWeight:800, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>19€/mes</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ padding:'14px 32px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer' }}>
            Ir al panel →
          </button>
          <button onClick={() => navigate('/ajustes')}
            style={{ padding:'14px 24px', background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer' }}>
            Ver ajustes
          </button>
        </div>

        <div style={{ marginTop:24, fontSize:12, color:'rgba(255,255,255,0.35)' }}>
          Recibirás un email de confirmación de Stripe · Cancela cuando quieras
        </div>
      </div>
    </div>
  );
}