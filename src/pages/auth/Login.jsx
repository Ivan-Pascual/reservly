import React, { useState } from 'react';
import { supabase } from '../../supabase';

export default function Login() {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [negocio, setNegocio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (modo === 'registro') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre_negocio: negocio }
        }
      });
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError('Email o contraseña incorrectos'); setLoading(false); return; }
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F4FAF7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
                stroke="#0A9E6E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
              <circle cx="21" cy="32" r="2.2" fill="#F4FAF7"/>
            </svg>
            <span style={{ fontSize: 26, fontWeight: 700, color: '#0B1E16' }}>Reservly</span>
          </div>
          <div style={{ fontSize: 14, color: '#6B9080' }}>Tus citas, en piloto automático</div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #EAF5EF', borderRadius: 16, padding: 32 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: 28, background: '#F4FAF7', borderRadius: 10, padding: 4 }}>
            {['login', 'registro'].map(m => (
              <button key={m} onClick={() => { setModo(m); setError(''); }} style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 8,
                background: modo === m ? '#fff' : 'transparent',
                color: modo === m ? '#0B1E16' : '#6B9080',
                fontWeight: modo === m ? 700 : 500,
                fontSize: 13.5, cursor: 'pointer',
                boxShadow: modo === m ? '0 1px 4px #0A9E6E20' : 'none',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.15s',
              }}>{m === 'login' ? 'Iniciar sesión' : 'Registrarse'}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {modo === 'registro' && (
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>
                  Nombre del negocio
                </label>
                <input
                  value={negocio}
                  onChange={e => setNegocio(e.target.value)}
                  placeholder="Ej: Peluqueria Mia"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 13.5, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#F4FAF7' }}
                  onFocus={e => e.target.style.borderColor = '#0A9E6E'}
                  onBlur={e => e.target.style.borderColor = '#D6EDE5'}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 13.5, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#F4FAF7' }}
                onFocus={e => e.target.style.borderColor = '#0A9E6E'}
                onBlur={e => e.target.style.borderColor = '#D6EDE5'}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#6B9080', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D6EDE5', borderRadius: 8, fontSize: 13.5, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#F4FAF7' }}
                onFocus={e => e.target.style.borderColor = '#0A9E6E'}
                onBlur={e => e.target.style.borderColor = '#D6EDE5'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0',
                background: loading ? '#A8C4B8' : '#0A9E6E',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans, sans-serif', marginTop: 4,
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>

          </div>

          {modo === 'login' && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6B9080' }}>
              ¿No tienes cuenta?{' '}
              <span onClick={() => setModo('registro')} style={{ color: '#0A9E6E', fontWeight: 600, cursor: 'pointer' }}>
                Regístrate gratis
              </span>
            </div>
          )}

        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#A8C4B8' }}>
          30 días gratis · Sin tarjeta · Cancela cuando quieras
        </div>

      </div>
    </div>
  );
}