import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { pushNotifications } from '../../services/notificacionesPush';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [negocio, setNegocio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registroOk, setRegistroOk] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email y contraseña son obligatorios.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    pushNotifications.solicitarPermiso();

    if (modo === 'registro') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre_negocio: negocio } },
      });
      if (error) {
        setError(error.message === 'User already registered'
          ? 'Ya existe una cuenta con este email. Inicia sesión.'
          : error.message);
        setLoading(false);
        return;
      }
      setRegistroOk(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError('Email o contraseña incorrectos.');
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  };

  const input = {
    width:'100%', padding:'11px 14px',
    border:'1.5px solid #D6EDE5', borderRadius:8,
    fontSize:14, fontFamily:'DM Sans, sans-serif',
    outline:'none', background:'#F4FAF7',
    transition:'border-color 0.15s',
  };

  if (registroOk) return (
    <div style={{ minHeight:'100vh', background:'#F4FAF7', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420, textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>📧</div>
        <h2 style={{ fontSize:24, fontWeight:700, color:'#0B1E16', marginBottom:10 }}>Revisa tu email</h2>
        <p style={{ fontSize:14, color:'#6B9080', lineHeight:1.7, marginBottom:24 }}>
          Hemos enviado un enlace de confirmación a <strong>{email}</strong>.<br/>
          Haz clic en el enlace para activar tu cuenta.
        </p>
        <div style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:12, padding:16, fontSize:13, color:'#063D2A', marginBottom:20 }}>
          ¿No ves el email? Revisa la carpeta de spam.
        </div>
        <button onClick={() => { setRegistroOk(false); setModo('login'); }}
          style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'12px 28px', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer' }}>
          Volver al login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F4FAF7', display:'flex', flexDirection:'column' }}>

      {/* Nav mínima */}
      <div style={{ padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
              stroke="#0A9E6E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
            <circle cx="21" cy="32" r="2.2" fill="#F4FAF7"/>
          </svg>
          <span style={{ fontSize:20, fontWeight:800, color:'#063D2A', letterSpacing:-0.5 }}>Reservly</span>
        </div>
        <button onClick={() => navigate('/demo')}
          style={{ background:'transparent', border:'1px solid #D6EDE5', color:'#6B9080', padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          Ver demo →
        </button>
      </div>

      {/* Contenido centrado */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 16px' }}>
        <div style={{ width:'100%', maxWidth:440 }}>

          <div style={{ textAlign:'center', marginBottom:24 }}>
            <h1 style={{ fontSize:'clamp(24px,4vw,32px)', fontWeight:800, color:'#0B1E16', marginBottom:8, letterSpacing:-0.5 }}>
              {modo === 'login' ? 'Bienvenido de nuevo' : 'Empieza gratis hoy'}
            </h1>
            <p style={{ fontSize:14, color:'#6B9080', margin:0 }}>
              {modo === 'login'
                ? 'Accede a tu panel de reservas'
                : 'Configura tu negocio en menos de 5 minutos'}
            </p>
          </div>

          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:20, padding:'28px 28px', boxShadow:'0 8px 40px rgba(10,158,110,0.08)' }}>

            {/* Tabs */}
            <div style={{ display:'flex', marginBottom:24, background:'#F4FAF7', borderRadius:12, padding:4 }}>
              {[
                { k:'login',    label:'Iniciar sesión' },
                { k:'registro', label:'Registrarse'    },
              ].map(m => (
                <button key={m.k} onClick={() => { setModo(m.k); setError(''); }} style={{
                  flex:1, padding:'9px 0', border:'none', borderRadius:9,
                  background: modo===m.k ? '#fff' : 'transparent',
                  color: modo===m.k ? '#0B1E16' : '#6B9080',
                  fontWeight: modo===m.k ? 700 : 500,
                  fontSize:14, cursor:'pointer',
                  boxShadow: modo===m.k ? '0 1px 6px rgba(10,158,110,0.12)' : 'none',
                  fontFamily:'DM Sans, sans-serif', transition:'all 0.15s',
                }}>{m.label}</button>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {modo === 'registro' && (
                <div>
                  <label style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>
                    Nombre del negocio
                  </label>
                  <input value={negocio} onChange={e=>setNegocio(e.target.value)}
                    placeholder="Ej: Peluquería Mía" style={input}
                    onFocus={e=>e.target.style.borderColor='#0A9E6E'}
                    onBlur={e=>e.target.style.borderColor='#D6EDE5'}/>
                </div>
              )}

              <div>
                <label style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>
                  Email
                </label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="tu@email.com" style={input}
                  onFocus={e=>e.target.style.borderColor='#0A9E6E'}
                  onBlur={e=>e.target.style.borderColor='#D6EDE5'}/>
              </div>

              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <label style={{ fontSize:11.5, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    Contraseña
                  </label>
                  {modo === 'login' && (
                    <span style={{ fontSize:12, color:'#0A9E6E', cursor:'pointer', fontWeight:600 }}
                      onClick={async () => {
                        if (!email.trim()) { setError('Introduce tu email para recuperar la contraseña.'); return; }
                        await supabase.auth.resetPasswordForEmail(email);
                        setError('');
                        alert(`Email de recuperación enviado a ${email}`);
                      }}>
                      ¿Olvidaste la contraseña?
                    </span>
                  )}
                </div>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" style={input}
                  onFocus={e=>e.target.style.borderColor='#0A9E6E'}
                  onBlur={e=>e.target.style.borderColor='#D6EDE5'}
                  onKeyDown={e=>e.key==='Enter' && handleSubmit()}/>
              </div>

              {error && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#EF4444' }}>
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                style={{ width:'100%', padding:'14px 0', background: loading ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'DM Sans, sans-serif', transition:'background 0.15s' }}>
                {loading ? 'Cargando...' : modo==='login' ? 'Entrar al panel →' : 'Crear cuenta gratis →'}
              </button>

            </div>

            <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#6B9080' }}>
              {modo === 'login' ? (
                <>¿No tienes cuenta?{' '}
                  <span onClick={() => { setModo('registro'); setError(''); }} style={{ color:'#0A9E6E', fontWeight:700, cursor:'pointer' }}>
                    Regístrate gratis
                  </span>
                </>
              ) : (
                <>¿Ya tienes cuenta?{' '}
                  <span onClick={() => { setModo('login'); setError(''); }} style={{ color:'#0A9E6E', fontWeight:700, cursor:'pointer' }}>
                    Iniciar sesión
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:20, flexWrap:'wrap' }}>
            {['✓ Gratis para empezar', '✓ Sin tarjeta', '✓ Cancela cuando quieras'].map(t => (
              <span key={t} style={{ fontSize:12, color:'#A8C4B8', fontWeight:500 }}>{t}</span>
            ))}
          </div>

        </div>
      </div>
    </div>
  )};