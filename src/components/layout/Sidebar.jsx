import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { usePlan } from '../../hooks/usePlan';

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

function NavItem({ to, emoji, label, badge, onClose, bloqueado }) {
  const navigate = useNavigate();

  if (bloqueado) {
    return (
      <div onClick={() => navigate('/ajustes')}
        style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'9px 12px', borderRadius:8,
          color:'#ffffff30', cursor:'pointer',
          fontSize:13.5, marginBottom:2,
          opacity:0.5,
        }}>
        <span>{emoji}</span>
        <span style={{ flex:1 }}>{label}</span>
        <span style={{ fontSize:10, color:'#ffffff30' }}>🔒</span>
      </div>
    );
  }

  return (
    <NavLink to={to} onClick={onClose}
      style={({ isActive }) => ({
        display:'flex', alignItems:'center', gap:10,
        padding:'9px 12px', borderRadius:8,
        color: isActive ? '#fff' : '#ffffff80',
        background: isActive ? '#0A9E6E' : 'transparent',
        fontWeight: isActive ? 600 : 500,
        fontSize:13.5, transition:'all 0.15s',
        marginBottom:2, textDecoration:'none',
      })}
    >
      <span>{emoji}</span>
      <span style={{ flex:1 }}>{label}</span>
      {badge > 0 && (
        <span style={{ background:'#F59E0B', color:'#fff', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:20 }}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar({ onClose, onBuscar }) {
  const [negocioNombre, setNegocioNombre] = useState('Mi negocio');
  const [negocioPlan, setNegocioPlan] = useState('trial');
  const [pendientes, setPendientes] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { esTrial, diasRestantes, puede } = usePlan();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (user.email === ADMIN_EMAIL) setIsAdmin(true);
      const { data: negocio } = await supabase
        .from('negocios').select('id, nombre, plan')
        .eq('user_id', user.id).single();
      if (negocio) {
        setNegocioNombre(negocio.nombre);
        setNegocioPlan(negocio.plan || 'trial');
        const { count } = await supabase
          .from('reservas').select('*', { count:'exact', head:true })
          .eq('negocio_id', negocio.id).eq('estado', 'pendiente');
        setPendientes(count || 0);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    if (!window.confirm('¿Cerrar sesión? Tendrás que volver a iniciar sesión para acceder al panel.')) return;
    await supabase.auth.signOut();
  };

  const planLabel = {
    trial:   'Prueba gratuita',
    basico:  'Plan Básico',
    pro:     'Plan Pro',
    agencia: 'Plan Agencia',
  }[negocioPlan] || 'Plan Básico';

  const cerrarSidebar = onClose || (() => {});

  return (
    <>
      <style>{`
        .sidebar-nav::-webkit-scrollbar { width: 3px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: #0A9E6E; border-radius: 4px; }
        .sidebar-nav { scrollbar-width: thin; scrollbar-color: #0A9E6E transparent; }
      `}</style>

      <aside style={{
        background:'#063D2A', width:240, height:'100vh',
        display:'flex', flexDirection:'column', flexShrink:0,
      }}>

        {/* Logo */}
        <div style={{ padding:'24px 20px 16px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
              stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="white"/>
            <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
          </svg>
          <span style={{ fontSize:17, fontWeight:700, color:'#fff', letterSpacing:-0.3 }}>Reservly</span>
        </div>

        {/* Buscador */}
        <div onClick={onBuscar}
          style={{ margin:'0 12px 8px', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, background:'#ffffff10', cursor:'pointer', border:'1px solid #ffffff15', flexShrink:0 }}>
          <span style={{ fontSize:14 }}>🔍</span>
          <span style={{ fontSize:13, color:'#ffffff60', flex:1 }}>Buscar...</span>
          <kbd style={{ fontSize:10, color:'#ffffff40', background:'#ffffff10', border:'1px solid #ffffff20', borderRadius:4, padding:'2px 5px' }}>⌘K</kbd>
        </div>

        {/* Nav */}
        <div className="sidebar-nav" style={{ padding:'0 12px', flex:1, overflowY:'auto', overflowX:'hidden' }}>

          <div style={{ fontSize:10, fontWeight:600, letterSpacing:'1.2px', color:'#ffffff40', textTransform:'uppercase', padding:'8px 12px 6px' }}>
            Principal
          </div>

          <NavItem to="/dashboard"  emoji="⊞"  label="Inicio"          onClose={cerrarSidebar} />
          <NavItem to="/reservas"   emoji="📅"  label="Reservas"        onClose={cerrarSidebar} badge={pendientes} />
          <NavItem to="/agenda"     emoji="🗓️" label="Agenda semanal"  onClose={cerrarSidebar} />
          <NavItem to="/clientes"   emoji="👤"  label="Clientes"        onClose={cerrarSidebar} />
          <NavItem to="/empleados"  emoji="👥"  label="Empleados"       onClose={cerrarSidebar} />
          <NavItem to="/servicios"  emoji="✂️"  label="Servicios"       onClose={cerrarSidebar} />
          <NavItem to="/stock"      emoji="📦"  label="Stock"           onClose={cerrarSidebar} />
          <NavItem to="/qr" emoji="⬛" label="QR de reserva" onClose={cerrarSidebar} />
          <div style={{ height:1, background:'#ffffff10', margin:'12px 0' }}/>

          <div style={{ fontSize:10, fontWeight:600, letterSpacing:'1.2px', color:'#ffffff40', textTransform:'uppercase', padding:'8px 12px 6px' }}>
            Gestión
          </div>

          <NavItem to="/fidelizacion" emoji="🏅" label="Fidelización"       onClose={cerrarSidebar} bloqueado={!puede('fidelizacion')} />
          <NavItem to="/comisiones"   emoji="⏱"  label="Comisiones"         onClose={cerrarSidebar} bloqueado={!puede('comisiones')} />
          <NavItem to="/vacaciones"   emoji="🏖️" label="Vacaciones"          onClose={cerrarSidebar} />
          <NavItem to="/bonos"        emoji="🎁"  label="Bonos y descuentos"  onClose={cerrarSidebar} bloqueado={!puede('bonos')} />
          <NavItem to="/valoraciones" emoji="⭐"  label="Valoraciones"        onClose={cerrarSidebar} bloqueado={!puede('resenas')} />
          <NavItem to="/estadisticas" emoji="📈"  label="Estadísticas"        onClose={cerrarSidebar} />

          <div style={{ height:1, background:'#ffffff10', margin:'12px 0' }}/>

          <NavItem to="/ajustes" emoji="⚙️" label="Ajustes" onClose={cerrarSidebar} />

          {isAdmin && (
            <>
              <div style={{ height:1, background:'#EF444430', margin:'12px 0' }}/>
              <NavItem to="/admin" emoji="⚡" label="Admin" onClose={cerrarSidebar} />
            </>
          )}

          <div style={{ height:12 }}/>
        </div>

        {/* Banner trial */}
        {esTrial && diasRestantes <= 7 && (
          <div style={{ margin:'0 12px 8px', background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:8, padding:'10px 12px', flexShrink:0 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#F59E0B', marginBottom:2 }}>
              ⏰ {diasRestantes} días de prueba
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>
              Elige un plan para continuar
            </div>
            <button onClick={() => window.location.href='/ajustes'}
              style={{ width:'100%', padding:'6px', background:'#F59E0B', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>
              Ver planes →
            </button>
          </div>
        )}

        {/* Usuario */}
        <div style={{ padding:'12px 16px 16px', borderTop:'1px solid #ffffff10', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {negocioNombre[0]?.toUpperCase()}
            </div>
            <div style={{ overflow:'hidden', flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{negocioNombre}</div>
              <div style={{ fontSize:10.5, color:'#0A9E6E', fontWeight:500 }}>{planLabel}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width:'100%', background:'#ffffff10', border:'1px solid #ffffff20',
            borderRadius:8, padding:'7px 0', color:'#ffffff80',
            fontSize:12, cursor:'pointer', fontFamily:'DM Sans, sans-serif', fontWeight:500,
          }}>Cerrar sesión</button>
        </div>

      </aside>
    </>
  );
}