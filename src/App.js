import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Onboarding from './pages/onboarding/Onboarding';
import Dashboard from './pages/dashboard/Dashboard';
import Reservas from './pages/reservas/Reservas';
import Clientes from './pages/clientes/Clientes';
import FichaCliente from './pages/clientes/FichaCliente';
import Empleados from './pages/empleados/Empleados';
import Servicios from './pages/servicios/Servicios';
import PagoExito from './pages/pago/PagoExito';
import Comisiones from './pages/comisiones/Comisiones';
import Privacidad from './pages/legal/Privacidad';
import Terminos from './pages/legal/Terminos';
import Admin from './pages/admin/Admin';
import Ajustes from './pages/ajustes/Ajustes';
import TPV from './pages/tpv/TPV';
import Landing from './pages/landing/Landing';
import PagoCancelado from './pages/pago/PagoCancelado';
import Vacaciones from './pages/vacaciones/Vacaciones';
import Bonos from './pages/bonos/Bonos';
import Valoraciones from './pages/valoraciones/Valoraciones';
import Estadisticas from './pages/estadisticas/Estadisticas';
import Agenda from './pages/agenda/Agenda';
import PaginaPublica from './pages/publica/PaginaPublica';
import ErrorBoundary from './components/ErrorBoundary';
import Stock from './pages/stock/Stock';
import HistorialStock from './pages/stock/HistorialStock';
import Demo from './pages/demo/Demo';

const TITULOS = {
  '/dashboard':    'Inicio',
  '/reservas':     'Reservas',
  '/agenda':       'Agenda semanal',
  '/clientes':     'Clientes',
  '/empleados':    'Empleados',
  '/servicios':    'Servicios',
  '/comisiones':   'Comisiones',
  '/bonos':        'Bonos y descuentos',
  '/valoraciones': 'Valoraciones',
  '/estadisticas': 'Estadísticas',
  '/ajustes':      'Ajustes',
  '/vacaciones':   'Vacaciones',
};

function TituloManager() {
  const location = useLocation();
  useEffect(() => {
    const ruta = '/' + location.pathname.split('/')[1];
    const titulo = TITULOS[ruta];
    document.title = titulo ? `${titulo} — Reservly` : 'Reservly';
  }, [location]);
  return null;
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:0, padding:40, textAlign:'center', minHeight:'60vh' }}>
      <div style={{ fontSize:80, marginBottom:16, lineHeight:1 }}>🔍</div>
      <div style={{ fontSize:11, fontWeight:700, color:'#0A9E6E', textTransform:'uppercase', letterSpacing:'2px', marginBottom:12 }}>Error 404</div>
      <h1 style={{ fontSize:'clamp(24px,4vw,36px)', fontWeight:800, color:'#0B1E16', marginBottom:12, letterSpacing:-0.5 }}>
        Página no encontrada
      </h1>
      <p style={{ fontSize:15, color:'#6B9080', maxWidth:400, lineHeight:1.7, marginBottom:32 }}>
        La URL que has introducido no existe. Puede que haya sido movida o que hayas cometido un error al escribirla.
      </p>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', marginBottom:40 }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ padding:'12px 24px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
          Ir al inicio →
        </button>
        <button onClick={() => navigate(-1)}
          style={{ padding:'12px 24px', background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>
          ← Volver atrás
        </button>
      </div>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
        {[
          { label:'Reservas',     ruta:'/reservas',     emoji:'📅' },
          { label:'Clientes',     ruta:'/clientes',     emoji:'👤' },
          { label:'Estadísticas', ruta:'/estadisticas', emoji:'📈' },
          { label:'Ajustes',      ruta:'/ajustes',      emoji:'⚙️' },
        ].map(a => (
          <div key={a.ruta} onClick={() => navigate(a.ruta)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'#F4FAF7', border:'1px solid #EAF5EF', borderRadius:8, cursor:'pointer', fontSize:13, color:'#6B9080', fontWeight:500 }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#E8F7F2'; e.currentTarget.style.color='#0A9E6E'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#F4FAF7'; e.currentTarget.style.color='#6B9080'; }}>
            <span>{a.emoji}</span>{a.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [negocio, setNegocio] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchNegocio(session.user.id);
      else setNegocio(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) fetchNegocio(session.user.id);
      else setNegocio(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNegocio = async (userId) => {
    const { data } = await supabase
      .from('negocios').select('*')
      .eq('user_id', userId).single();
    setNegocio(data || null);
  };

  if (session === undefined || negocio === undefined) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F4FAF7' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <TituloManager />
        <Routes>

          {/* Rutas 100% públicas — sin login nunca */}
          <Route path="/"          element={session ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/landing"   element={<Landing />} />
          <Route path="/demo"      element={<Demo />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/terminos"  element={<Terminos />} />
          <Route path="/reservar/:slug" element={<PaginaPublica />} />

          {/* Login — ruta pública */}
          <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />

          {/* Admin — fuera del Layout */}
          <Route path="/admin" element={<Admin />} />

          {/* Rutas privadas */}
          <Route path="/*" element={
            !session ? <Navigate to="/login" replace /> :
            (negocio && !negocio.onboarding_completado) ? (
              <Onboarding negocioId={negocio.id} onComplete={() => fetchNegocio(session.user.id)} />
            ) : (
              <Layout>
                <Routes>
                  <Route path="/dashboard"           element={<Dashboard />} />
                  <Route path="/reservas"            element={<Reservas />} />
                  <Route path="/agenda"              element={<Agenda />} />
                  <Route path="/clientes"            element={<Clientes />} />
                  <Route path="/clientes/:id"        element={<FichaCliente />} />
                  <Route path="/empleados"           element={<Empleados />} />
                  <Route path="/servicios"           element={<Servicios />} />
                  <Route path="/comisiones"          element={<Comisiones />} />
                  <Route path="/bonos"               element={<Bonos />} />
                  <Route path="/valoraciones"        element={<Valoraciones />} />
                  <Route path="/estadisticas"        element={<Estadisticas />} />
                  <Route path="/ajustes"             element={<Ajustes />} />
                  <Route path="/vacaciones"          element={<Vacaciones />} />
                  <Route path="/stock"               element={<Stock />} />
                  <Route path="/tpv/:reservaId"      element={<TPV />} />
                  <Route path="/pago/exito" element={<PagoExito />} />
                  <Route path="/pago/cancelado" element={<PagoCancelado />} />
                  <Route path="/stock/:id/historial" element={<HistorialStock />} />
                  <Route path="*"                    element={<NotFound />} />
                </Routes>
              </Layout>
            )
          } />

        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}