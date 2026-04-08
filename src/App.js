import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Comisiones from './pages/comisiones/Comisiones';
import Ajustes from './pages/ajustes/Ajustes';
import TPV from './pages/tpv/TPV';
import Vacaciones from './pages/vacaciones/Vacaciones';
import Bonos from './pages/bonos/Bonos';
import Valoraciones from './pages/valoraciones/Valoraciones';
import Estadisticas from './pages/estadisticas/Estadisticas';
import Agenda from './pages/agenda/Agenda';
import PaginaPublica from './pages/publica/PaginaPublica';
import ErrorBoundary from './components/ErrorBoundary';

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
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:40 }}>
      <div style={{ fontSize:64 }}>🔍</div>
      <div style={{ fontSize:24, fontWeight:700, color:'#0B1E16' }}>Página no encontrada</div>
      <div style={{ fontSize:14, color:'#6B9080' }}>La URL que has introducido no existe</div>
      <a href="/dashboard" style={{ background:'#0A9E6E', color:'#fff', padding:'10px 24px', borderRadius:8, fontSize:13, fontWeight:600, textDecoration:'none', marginTop:8 }}>
        Volver al inicio
      </a>
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

          {/* Página pública sin login */}
          <Route path="/reservar/:slug" element={<PaginaPublica />} />

          {/* Rutas privadas */}
          <Route path="/*" element={
            !session ? <Login /> :
            (negocio && !negocio.onboarding_completado) ? (
              <Onboarding negocioId={negocio.id} onComplete={() => fetchNegocio(session.user.id)} />
            ) : (
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard"      element={<Dashboard />} />
                  <Route path="/reservas"       element={<Reservas />} />
                  <Route path="/agenda"         element={<Agenda />} />
                  <Route path="/clientes"       element={<Clientes />} />
                  <Route path="/clientes/:id"   element={<FichaCliente />} />
                  <Route path="/empleados"      element={<Empleados />} />
                  <Route path="/servicios"      element={<Servicios />} />
                  <Route path="/comisiones"     element={<Comisiones />} />
                  <Route path="/bonos"          element={<Bonos />} />
                  <Route path="/valoraciones"   element={<Valoraciones />} />
                  <Route path="/estadisticas"   element={<Estadisticas />} />
                  <Route path="/ajustes"        element={<Ajustes />} />
                  <Route path="/vacaciones"     element={<Vacaciones />} />
                  <Route path="/tpv/:reservaId" element={<TPV />} />
                  <Route path="*"               element={<NotFound />} />
                </Routes>
              </Layout>
            )
          } />

        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}