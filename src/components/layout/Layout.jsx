import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import BusquedaGlobal from '../BusquedaGlobal';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showBusqueda, setShowBusqueda] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowBusqueda(b => !b);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F4FAF7', position:'relative' }}>

      {/* Overlay móvil */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:40 }}/>
      )}

      {/* Sidebar */}
      <div style={{
        position: isMobile ? 'fixed' : 'sticky',
        top:0, left:0, zIndex:50,
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: 'transform 0.25s ease',
        height: '100vh',
        flexShrink: 0,
      }}>
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onBuscar={() => setShowBusqueda(true)}
        />
      </div>

      {/* Main */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflowX:'hidden' }}>

        {/* Topbar móvil */}
        {isMobile && (
          <div style={{ background:'#063D2A', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:30 }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ background:'transparent', border:'none', cursor:'pointer', padding:4, display:'flex', flexDirection:'column', gap:5 }}>
              <div style={{ width:22, height:2, background:'#fff', borderRadius:1 }}/>
              <div style={{ width:22, height:2, background:'#fff', borderRadius:1 }}/>
              <div style={{ width:22, height:2, background:'#fff', borderRadius:1 }}/>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
                  stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="21" cy="32" r="4.5" fill="white"/>
                <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
              </svg>
              <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Reservly</span>
            </div>
            {/* Botón buscar en móvil */}
            <button onClick={() => setShowBusqueda(true)}
              style={{ marginLeft:'auto', background:'#ffffff15', border:'none', borderRadius:8, padding:'6px 10px', color:'#fff', fontSize:14, cursor:'pointer' }}>
              🔍
            </button>
          </div>
        )}

        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          {children}
        </div>

      </main>

      {/* Búsqueda global */}
      {showBusqueda && <BusquedaGlobal onClose={() => setShowBusqueda(false)} />}

    </div>
  );
}