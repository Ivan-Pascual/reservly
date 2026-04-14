import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';

const SELLOS_PARA_PREMIO = 10;

export default function Fidelizacion() {
  const { negocio, loading: negocioLoading } = useNegocio();
  const isMobile = useIsMobile();
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [accion, setAccion] = useState(null); // { clienteId, tipo: 'add' | 'canjear' }
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!negocio) return;
    fetchData();
  }, [negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    const { data: clientesData } = await supabase
      .from('clientes')
      .select('id, nombre, telefono, email, tag')
      .eq('negocio_id', negocio.id)
      .order('nombre');

    const { data: sellosData } = await supabase
      .from('sellos')
      .select('*')
      .eq('negocio_id', negocio.id);

    const sellosMap = {};
    (sellosData || []).forEach(s => { sellosMap[s.cliente_id] = s; });

    setClientes((clientesData || []).map(c => ({
      ...c,
      sellos: sellosMap[c.id] || { total_sellos: 0, sellos_canjeados: 0 },
    })));
    setCargando(false);
  };

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const añadirSello = async (clienteId) => {
    setSaving(true);
    const cliente = clientes.find(c => c.id === clienteId);
    const sellosActuales = cliente.sellos.total_sellos || 0;

    const { data: existing } = await supabase
      .from('sellos').select('id').eq('negocio_id', negocio.id).eq('cliente_id', clienteId).single();

    if (existing) {
      await supabase.from('sellos').update({
        total_sellos: sellosActuales + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('sellos').insert({
        negocio_id: negocio.id,
        cliente_id: clienteId,
        total_sellos: 1,
        sellos_canjeados: 0,
      });
    }

    await fetchData();
    mostrarToast('✓ Sello añadido');
    setSaving(false);
    setAccion(null);
  };

  const canjearPremio = async (clienteId) => {
    setSaving(true);
    const cliente = clientes.find(c => c.id === clienteId);
    const sellos = cliente.sellos;
    const sellosDisponibles = (sellos.total_sellos || 0) - (sellos.sellos_canjeados || 0);

    if (sellosDisponibles < SELLOS_PARA_PREMIO) {
      mostrarToast('No tiene suficientes sellos para canjear');
      setSaving(false);
      setAccion(null);
      return;
    }

    await supabase.from('sellos').update({
      sellos_canjeados: (sellos.sellos_canjeados || 0) + SELLOS_PARA_PREMIO,
      updated_at: new Date().toISOString(),
    }).eq('negocio_id', negocio.id).eq('cliente_id', clienteId);

    await fetchData();
    mostrarToast('🎁 Premio canjeado correctamente');
    setSaving(false);
    setAccion(null);
  };

  const filtrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  );

  const pad = isMobile ? 16 : 32;

  if (cargando || negocioLoading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {toast && (
        <div style={{
          position:'fixed', bottom:24, right:24, zIndex:9999,
          background:'#063D2A', color:'#fff',
          padding:'12px 20px', borderRadius:12,
          fontSize:13, fontWeight:600,
          display:'flex', alignItems:'center', gap:8,
          boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
          animation:'slideIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Fidelización</div>
        <div style={{ background:'#E8F7F2', padding:'3px 10px', borderRadius:20, fontSize:12, color:'#063D2A', fontWeight:600 }}>
          🎁 {SELLOS_PARA_PREMIO} sellos = 1 premio
        </div>
        <div style={{ marginLeft:'auto' }}>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar cliente..."
            style={{ padding:'7px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', width: isMobile ? 140 : 200 }}
            onFocus={e => e.target.style.borderColor='#0A9E6E'}
            onBlur={e => e.target.style.borderColor='#D6EDE5'}
          />
        </div>
      </div>

      <div style={{ padding:pad }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10, marginBottom:20 }}>
          {[
            { label:'Clientes activos',  value: clientes.filter(c => c.sellos.total_sellos > 0).length, featured:true },
            { label:'Sellos repartidos', value: clientes.reduce((a, c) => a + (c.sellos.total_sellos || 0), 0) },
            { label:'Premios canjeados', value: clientes.reduce((a, c) => a + Math.floor((c.sellos.sellos_canjeados || 0) / SELLOS_PARA_PREMIO), 0) },
            { label:'Listos para canjear', value: clientes.filter(c => {
              const disp = (c.sellos.total_sellos || 0) - (c.sellos.sellos_canjeados || 0);
              return disp >= SELLOS_PARA_PREMIO;
            }).length },
          ].map(s => (
            <div key={s.label} style={{ background: s.featured ? '#063D2A' : '#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, fontWeight:600, color: s.featured ? '#ffffff60' : '#6B9080', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:700, color: s.featured ? '#fff' : '#0B1E16', fontFamily:'DM Mono, monospace', lineHeight:1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Lista clientes */}
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', fontSize:14, fontWeight:700, color:'#0B1E16' }}>
            Tarjetas de fidelización — {filtrados.length} clientes
          </div>
          <div style={{ padding:'8px 16px' }}>
            {filtrados.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#A8C4B8' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🎁</div>
                <div style={{ fontSize:14 }}>No hay clientes aún</div>
              </div>
            ) : filtrados.map(c => {
              const sellosDisponibles = (c.sellos.total_sellos || 0) - (c.sellos.sellos_canjeados || 0);
              const sellosActivos = sellosDisponibles % SELLOS_PARA_PREMIO;
              const premiosDisponibles = Math.floor(sellosDisponibles / SELLOS_PARA_PREMIO);
              const pct = (sellosActivos / SELLOS_PARA_PREMIO) * 100;

              return (
                <div key={c.id} style={{ padding:'14px 4px', borderBottom:'1px solid #EAF5EF', display:'flex', alignItems:'center', gap:14, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  
                  {/* Avatar */}
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'#063D2A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', flexShrink:0 }}>
                    {c.nombre?.[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:600, color:'#0B1E16' }}>{c.nombre}</span>
                      {premiosDisponibles > 0 && (
                        <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#FFF8E7', color:'#92400E' }}>
                          🎁 {premiosDisponibles} premio{premiosDisponibles > 1 ? 's' : ''} disponible{premiosDisponibles > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Barra de sellos */}
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:6, background:'#EAF5EF', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:'#0A9E6E', borderRadius:3, transition:'width 0.3s' }}/>
                      </div>
                      <span style={{ fontSize:12, fontFamily:'DM Mono, monospace', color:'#6B9080', flexShrink:0 }}>
                        {sellosActivos}/{SELLOS_PARA_PREMIO}
                      </span>
                    </div>

                    {/* Sellos visuales */}
                    <div style={{ display:'flex', gap:4, marginTop:6, flexWrap:'wrap' }}>
                      {Array.from({ length: SELLOS_PARA_PREMIO }).map((_, i) => (
                        <div key={i} style={{
                          width:18, height:18, borderRadius:'50%',
                          background: i < sellosActivos ? '#0A9E6E' : '#EAF5EF',
                          border: `1.5px solid ${i < sellosActivos ? '#0A9E6E' : '#D6EDE5'}`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:9, color:'#fff',
                        }}>
                          {i < sellosActivos ? '✓' : ''}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <button onClick={() => añadirSello(c.id)} disabled={saving}
                      style={{ padding:'7px 14px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      + Sello
                    </button>
                    {premiosDisponibles > 0 && (
                      <button onClick={() => canjearPremio(c.id)} disabled={saving}
                        style={{ padding:'7px 14px', background:'#F59E0B', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        🎁 Canjear
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}