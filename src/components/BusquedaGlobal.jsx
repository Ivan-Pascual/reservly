import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useNegocio } from '../hooks/useNegocio';

export default function BusquedaGlobal({ onClose }) {
  const { negocio } = useNegocio();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(0);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    if (!query.trim() || !negocio) { setResultados([]); return; }
    const timer = setTimeout(() => buscar(query), 250);
    return () => clearTimeout(timer);
  }, [query, negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const buscar = async (q) => {
    setCargando(true);
    const termino = q.toLowerCase();

    const [cliRes, resRes, serRes, stockRes, empRes] = await Promise.all([
      supabase.from('clientes').select('id, nombre, telefono, tag')
        .eq('negocio_id', negocio.id)
        .or(`nombre.ilike.%${termino}%,telefono.ilike.%${termino}%`)
        .limit(5),
      supabase.from('reservas').select('id, fecha, hora_inicio, estado, clientes(nombre), servicios(nombre)')
        .eq('negocio_id', negocio.id)
        .gte('fecha', new Date().toISOString().split('T')[0])
        .order('fecha').limit(5),
      supabase.from('servicios').select('id, nombre, precio, duracion')
        .eq('negocio_id', negocio.id).eq('activo', true)
        .ilike('nombre', `%${termino}%`)
        .limit(4),
      supabase.from('productos').select('id, nombre, stock_actual, precio_venta')
        .eq('negocio_id', negocio.id)
        .ilike('nombre', `%${termino}%`)
        .limit(4),
      supabase.from('empleados').select('id, nombre, email, color')
        .eq('negocio_id', negocio.id).eq('activo', true)
        .ilike('nombre', `%${termino}%`)
        .limit(3),
    ]);

    const items = [];

    if (cliRes.data) {
      cliRes.data.forEach(c => items.push({
        id: c.id, tipo:'cliente',
        titulo: c.nombre, subtitulo: c.telefono || 'Sin teléfono',
        emoji:'👤', ruta:`/clientes/${c.id}`,
      }));
    }

    if (resRes.data) {
      resRes.data
        .filter(r => r.clientes?.nombre?.toLowerCase().includes(termino) ||
                     r.servicios?.nombre?.toLowerCase().includes(termino))
        .forEach(r => items.push({
          id: r.id, tipo:'reserva',
          titulo: r.clientes?.nombre || 'Cliente',
          subtitulo: `${r.servicios?.nombre || '—'} · ${r.fecha} ${r.hora_inicio?.slice(0,5)}`,
          emoji:'📅', estado: r.estado, ruta:'/reservas',
        }));
    }

    if (serRes.data) {
      serRes.data.forEach(s => items.push({
        id: s.id, tipo:'servicio',
        titulo: s.nombre,
        subtitulo: `${s.duracion} min · ${s.precio ? s.precio+' EUR' : 'A consultar'}`,
        emoji:'✂️', ruta:'/servicios',
      }));
    }

    if (stockRes.data) {
      stockRes.data.forEach(p => items.push({
        id: p.id, tipo:'stock',
        titulo: p.nombre,
        subtitulo: `Stock: ${p.stock_actual ?? 0} · ${p.precio_venta ? p.precio_venta+' EUR' : 'Sin precio'}`,
        emoji:'📦',
        stockBajo: p.stock_actual !== null && p.stock_actual <= 3,
        ruta:'/stock',
      }));
    }

    if (empRes.data) {
      empRes.data.forEach(e => items.push({
        id: e.id, tipo:'empleado',
        titulo: e.nombre,
        subtitulo: e.email || 'Sin email',
        emoji:'👥', color: e.color,
        ruta:'/empleados',
      }));
    }

    setResultados(items);
    setIndiceActivo(0);
    setCargando(false);
  };

  const irA = (ruta) => { navigate(ruta); onClose(); };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndiceActivo(i => Math.min(i+1, resultados.length-1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndiceActivo(i => Math.max(i-1, 0)); }
    else if (e.key === 'Enter' && resultados[indiceActivo]) { irA(resultados[indiceActivo].ruta); }
    else if (e.key === 'Escape') { onClose(); }
  };

  const ESTADO_COLORS = {
    confirmada:'#0A9E6E', pendiente:'#F59E0B', completada:'#A8C4B8', cancelada:'#EF4444',
  };

  const TIPO_LABELS = {
    cliente:'Clientes', reserva:'Reservas próximas', servicio:'Servicios',
    stock:'Stock', empleado:'Empleados',
  };

  const atajos = [
    { emoji:'📅', label:'Reservas',     ruta:'/reservas'     },
    { emoji:'👤', label:'Clientes',     ruta:'/clientes'     },
    { emoji:'✂️', label:'Servicios',    ruta:'/servicios'    },
    { emoji:'📦', label:'Stock',        ruta:'/stock'        },
    { emoji:'👥', label:'Empleados',    ruta:'/empleados'    },
    { emoji:'📈', label:'Estadísticas', ruta:'/estadisticas' },
  ];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99999, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:60 }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:560, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={e=>e.stopPropagation()}>

        {/* Input */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 18px', borderBottom:'1px solid #EAF5EF' }}>
          <span style={{ fontSize:18, color:'#A8C4B8' }}>🔍</span>
          <input ref={inputRef} value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar clientes, reservas, servicios, stock, empleados..."
            style={{ flex:1, border:'none', outline:'none', fontSize:15, color:'#0B1E16', background:'transparent', fontFamily:'DM Sans, sans-serif' }}/>
          {cargando && <span style={{ fontSize:12, color:'#A8C4B8' }}>...</span>}
          <kbd onClick={onClose} style={{ fontSize:11, color:'#A8C4B8', background:'#F4FAF7', border:'1px solid #D6EDE5', borderRadius:6, padding:'3px 7px', cursor:'pointer' }}>
            Esc
          </kbd>
        </div>

        {/* Resultados */}
        {query.trim() ? (
          <div style={{ maxHeight:420, overflowY:'auto' }}>
            {resultados.length > 0 ? (
              ['cliente','reserva','servicio','stock','empleado'].map(tipo => {
                const items = resultados.filter(r => r.tipo === tipo);
                if (items.length === 0) return null;
                return (
                  <div key={tipo}>
                    <div style={{ padding:'8px 18px 4px', fontSize:10.5, fontWeight:600, color:'#A8C4B8', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                      {TIPO_LABELS[tipo]}
                    </div>
                    {items.map(item => {
                      const globalIdx = resultados.indexOf(item);
                      return (
                        <div key={item.id} onClick={() => irA(item.ruta)}
                          style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 18px', cursor:'pointer', background: globalIdx===indiceActivo ? '#E8F7F2' : 'transparent' }}
                          onMouseEnter={() => setIndiceActivo(globalIdx)}>
                          {tipo === 'empleado' ? (
                            <div style={{ width:28, height:28, borderRadius:'50%', background:item.color||'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                              {item.titulo[0]?.toUpperCase()}
                            </div>
                          ) : (
                            <span style={{ fontSize:18, flexShrink:0 }}>{item.emoji}</span>
                          )}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.titulo}</div>
                            <div style={{ fontSize:12, color:'#6B9080', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.subtitulo}</div>
                          </div>
                          {item.estado && (
                            <div style={{ width:8, height:8, borderRadius:'50%', background:ESTADO_COLORS[item.estado]||'#ccc', flexShrink:0 }}/>
                          )}
                          {item.stockBajo && (
                            <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:10, background:'#FEF2F2', color:'#EF4444', flexShrink:0 }}>Stock bajo</span>
                          )}
                          <span style={{ fontSize:11, color:'#A8C4B8', flexShrink:0 }}>→</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              !cargando && (
                <div style={{ padding:'32px 18px', textAlign:'center', color:'#A8C4B8' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>🔍</div>
                  <div style={{ fontSize:14 }}>Sin resultados para "{query}"</div>
                </div>
              )
            )}
          </div>
        ) : (
          <div style={{ padding:'12px 18px 16px' }}>
            <div style={{ fontSize:10.5, fontWeight:600, color:'#A8C4B8', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>
              Acceso rápido
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
              {atajos.map(a => (
                <div key={a.ruta} onClick={() => irA(a.ruta)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, border:'1px solid #EAF5EF', cursor:'pointer', background:'#F4FAF7' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#E8F7F2'}
                  onMouseLeave={e=>e.currentTarget.style.background='#F4FAF7'}>
                  <span style={{ fontSize:16 }}>{a.emoji}</span>
                  <span style={{ fontSize:12.5, fontWeight:600, color:'#0B1E16' }}>{a.label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, fontSize:11.5, color:'#A8C4B8', textAlign:'center' }}>
              Usa ↑↓ para navegar · Enter para ir · Esc para cerrar
            </div>
          </div>
        )}
      </div>
    </div>
  );
}