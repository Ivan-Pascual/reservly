import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';

export default function PlanGate({ feature, children, planRequerido = 'pro' }) {
  const { puede } = usePlan();
  const navigate = useNavigate();

  if (puede(feature)) return children;

  const labels = {
    pro:     { nombre: 'Plan Pro', precio: '39€/mes', color: '#0A9E6E' },
    agencia: { nombre: 'Plan Agencia', precio: '79€/mes', color: '#063D2A' },
  };
  const plan = labels[planRequerido] || labels.pro;

  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ maxWidth:420, textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#EAF5EF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 20px' }}>
          🔒
        </div>
        <h2 style={{ fontSize:20, fontWeight:800, color:'#0B1E16', marginBottom:8, letterSpacing:-0.3 }}>
          Feature del {plan.nombre}
        </h2>
        <p style={{ fontSize:14, color:'#6B9080', lineHeight:1.7, marginBottom:24 }}>
          Esta función está disponible a partir del {plan.nombre} por {plan.precio}. Actualiza tu plan para desbloquearla.
        </p>
        <button onClick={() => navigate('/ajustes')}
          style={{ padding:'12px 28px', background: plan.color, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
          Ver planes →
        </button>
      </div>
    </div>
  );
}