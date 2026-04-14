import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../../supabase';

const ADMIN_EMAIL = 'ivanpascual100@gmail.com';

function NavItem({ to, emoji, label, badge, onClose }) {
  return (
    <NavLink to={to} onClick={onClose}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 8,
        color: isActive ? '#fff' : '#ffffff80',
        background: isActive ? '#0A9E6E' : 'transparent',
        fontWeight: isActive ? 600 : 500,
        fontSize: 13.5, transition: 'all 0.15s',
        marginBottom: 2, textDecoration: 'none',
      })}
    >
      <span>{emoji}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span style={{ background: '#F59E0B', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20 }}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar({ onClose, onBuscar }) {
  const [negocioNombre, setNegocioNombre] = useState('Mi negocio');
  const [pendientes, setPendientes] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (user.email === ADMIN_EMAIL) setIsAdmin(true);
      const { data: negocio } = await supabase
        .from('negocios').select('id, nombre')
        .eq('user_id', user.id).single();
      if (negocio) {
        setNegocioNombre(negocio.nombre);
        const { count } = await supabase
          .from('reservas').select('*', { count: 'exact', head: true })
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

  const cerrarSidebar = onClose || (() => {});

  return (
    <aside style={{
      background: '#063D2A', width: 240, height: '100vh',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
            stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="21" cy="32" r="4.5" fill="white"/>
          <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
        </svg>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Reservly</span>
      </div>

      {/* Buscador */}
      <div onClick={onBuscar}
        style={{ margin:'0 12px 8px', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, background:'#ffffff10', cursor:'pointer', border:'1px solid #ffffff15' }}>
        <span style={{ fontSize:14 }}>🔍</span>
        <span style={{ fontSize:13, color:'#ffffff60', flex:1 }}>Buscar...</span>
        <kbd style={{ fontSize:10, color:'#ffffff40', background:'#ffffff10', border:'1px solid #ffffff20', borderRadius:4, padding:'2px 5px' }}>⌘K</kbd>
      </div>

      {/* Nav */}
      <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>

        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.2px', color: '#ffffff40', textTransform: 'uppercase', padding: '8px 12px 6px' }}>
          Principal
        </div>

        <NavItem to="/dashboard"  emoji="⊞"  label="Inicio"            onClose={cerrarSidebar} />
        <NavItem to="/reservas"   emoji="📅"  label="Reservas"          onClose={cerrarSidebar} badge={pendientes} />
        <NavItem to="/agenda"     emoji="🗓️" label="Agenda semanal"    onClose={cerrarSidebar} />
        <NavItem to="/clientes"   emoji="👤"  label="Clientes"          onClose={cerrarSidebar} />
        <NavItem to="/empleados"  emoji="👥"  label="Empleados"         onClose={cerrarSidebar} />
        <NavItem to="/servicios"  emoji="✂️"  label="Servicios"         onClose={cerrarSidebar} />
        <NavItem to="/stock"      emoji="📦"  label="Stock"             onClose={cerrarSidebar} />

        <div style={{ height: 1, background: '#ffffff10', margin: '12px 0' }} />

        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.2px', color: '#ffffff40', textTransform: 'uppercase', padding: '8px 12px 6px' }}>
          Gestión
        </div>

        <NavItem to="/comisiones"   emoji="⏱"  label="Comisiones"         onClose={cerrarSidebar} />
        <NavItem to="/vacaciones"   emoji="🏖️" label="Vacaciones"          onClose={cerrarSidebar} />
        <NavItem to="/bonos"        emoji="🎁"  label="Bonos y descuentos"  onClose={cerrarSidebar} />
        <NavItem to="/valoraciones" emoji="⭐"  label="Valoraciones"        onClose={cerrarSidebar} />
        <NavItem to="/estadisticas" emoji="📈"  label="Estadísticas"        onClose={cerrarSidebar} />

        <div style={{ height: 1, background: '#ffffff10', margin: '12px 0' }} />

        <NavItem to="/ajustes" emoji="⚙️" label="Ajustes" onClose={cerrarSidebar} />

        {isAdmin && (
          <>
            <div style={{ height: 1, background: '#EF444430', margin: '12px 0' }} />
            <NavItem to="/admin" emoji="⚡" label="Admin" onClose={cerrarSidebar} />
          </>
        )}
      </div>

      {/* Usuario */}
      <div style={{ padding: 16, borderTop: '1px solid #ffffff10', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0A9E6E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {negocioNombre[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{negocioNombre}</div>
            <div style={{ fontSize: 10.5, color: '#0A9E6E', fontWeight: 500 }}>Plan Solo · Activo</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', background: '#ffffff10', border: '1px solid #ffffff20',
          borderRadius: 8, padding: '7px 0', color: '#ffffff80',
          fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
        }}>Cerrar sesión</button>
      </div>

    </aside>
  );
}