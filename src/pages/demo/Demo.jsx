import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DATOS_DEMO = {
  reservasHoy: [
    { id:1, clientes:{ nombre:'Carmen López' }, servicios:{ nombre:'Corte y peinado' }, empleados:{ nombre:'María García', color:'#0A9E6E' }, hora_inicio:'09:00', hora_fin:'10:00', estado:'confirmada' },
    { id:2, clientes:{ nombre:'Ana Martínez' }, servicios:{ nombre:'Tinte' }, empleados:{ nombre:'Laura Pérez', color:'#3B82F6' }, hora_inicio:'10:30', hora_fin:'12:00', estado:'confirmada' },
    { id:3, clientes:{ nombre:'Rosa Fernández' }, servicios:{ nombre:'Corte' }, empleados:{ nombre:'María García', color:'#0A9E6E' }, hora_inicio:'12:00', hora_fin:'12:45', estado:'pendiente' },
    { id:4, clientes:{ nombre:'Julia Sánchez' }, servicios:{ nombre:'Manicura' }, empleados:{ nombre:'Laura Pérez', color:'#3B82F6' }, hora_inicio:'16:00', hora_fin:'17:00', estado:'confirmada' },
  ],
  stats: { hoy:4, mes:87, pendientes:3, canceladas:1, facturacionHoy:156, facturacionMes:3240, facturacionTotal:18750, clientesTotal:142, clientesMes:8 },
  clientes: [
    { id:1, nombre:'Carmen López', telefono:'+34 612 345 678', tag:'vip', sexo:'mujer' },
    { id:2, nombre:'Ana Martínez', telefono:'+34 623 456 789', tag:'regular', sexo:'mujer' },
    { id:3, nombre:'Pedro García', telefono:'+34 634 567 890', tag:'nuevo', sexo:'hombre' },
    { id:4, nombre:'Rosa Fernández', telefono:'+34 645 678 901', tag:'regular', sexo:'mujer' },
    { id:5, nombre:'Julia Sánchez', telefono:'+34 656 789 012', tag:'vip', sexo:'mujer' },
  ],
  servicios: [
    { id:1, nombre:'Corte de pelo', duracion:45, precio:25, categoria:'Corte' },
    { id:2, nombre:'Tinte', duracion:90, precio:55, categoria:'Color' },
    { id:3, nombre:'Peinado', duracion:60, precio:35, categoria:'Peinado' },
    { id:4, nombre:'Manicura', duracion:60, precio:30, categoria:'Tratamiento' },
  ],
  empleados: [
    { id:1, nombre:'María García', color:'#0A9E6E', tipo_comision:'porcentaje', comision_valor:10, citas:12, facturado:420 },
    { id:2, nombre:'Laura Pérez', color:'#3B82F6', tipo_comision:'fijo', comision_valor:5, citas:9, facturado:310 },
  ],
  stock: [
    { id:1, nombre:'Champú hidratante', categoria:'Champús', stock_actual:12, stock_minimo:5, precio_venta:14.90 },
    { id:2, nombre:'Tinte rubio', categoria:'Tintes', stock_actual:3, stock_minimo:5, precio_venta:8.90 },
    { id:3, nombre:'Mascarilla reparadora', categoria:'Tratamientos', stock_actual:0, stock_minimo:3, precio_venta:22.50 },
    { id:4, nombre:'Acondicionador', categoria:'Champús', stock_actual:8, stock_minimo:4, precio_venta:12.90 },
  ],
};

const TAG_STYLES = {
  vip:     { bg:'#F5F3FF', color:'#8B5CF6', label:'⭐ VIP'  },
  regular: { bg:'#E8F7F2', color:'#063D2A', label:'Regular' },
  nuevo:   { bg:'#FFF8E7', color:'#92400E', label:'Nuevo'   },
};

const ESTADO_STYLES = {
  confirmada: { bg:'#E8F7F2', color:'#063D2A', label:'Confirmada' },
  pendiente:  { bg:'#FFF8E7', color:'#92400E', label:'Pendiente'  },
};

const NAV_ITEMS = [
  { id:'dashboard', emoji:'⊞',  label:'Inicio'    },
  { id:'reservas',  emoji:'📅', label:'Reservas'  },
  { id:'clientes',  emoji:'👤', label:'Clientes'  },
  { id:'servicios', emoji:'✂️', label:'Servicios' },
  { id:'empleados', emoji:'👥', label:'Empleados' },
  { id:'stock',     emoji:'📦', label:'Stock'     },
];

export default function Demo() {
  const navigate = useNavigate();
  const [pantalla, setPantalla] = useState('dashboard');
  const [hora, setHora] = useState(new Date().getHours());
  const [isSmall, setIsSmall] = useState(window.innerWidth < 500);

  useEffect(() => {
    const interval = setInterval(() => setHora(new Date().getHours()), 60000);
    const onResize = () => setIsSmall(window.innerWidth < 500);
    window.addEventListener('resize', onResize);
    return () => { clearInterval(interval); window.removeEventListener('resize', onResize); };
  }, []);

  const saludo = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';
  const sidebarW = isSmall ? 52 : 200;

  const Topbar = ({ titulo }) => (
    <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 16px', height:52, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>{titulo}</div>
      <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:20, padding:'2px 8px', fontSize:10, color:'#92400E', fontWeight:600 }}>Demo</div>
      {!isSmall && (
        <button onClick={() => navigate('/login')}
          style={{ marginLeft:'auto', background:'#0A9E6E', color:'#fff', border:'none', padding:'6px 12px', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
          Crear cuenta →
        </button>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <Topbar titulo="Inicio"/>
      <div style={{ padding:isSmall ? 10 : 20, display:'flex', flexDirection:'column', gap:12 }}>
        {!isSmall && <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>{saludo}, Peluquería Demo 👋</div>}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { label:'Citas hoy',     value: DATOS_DEMO.stats.hoy,              featured:true },
            { label:'Este mes',      value: DATOS_DEMO.stats.mes },
            { label:'Facturado hoy', value: `${DATOS_DEMO.stats.facturacionHoy}€` },
            { label:'Clientes',      value: DATOS_DEMO.stats.clientesTotal },
          ].map(s => (
            <div key={s.label} style={{ background: s.featured ? '#063D2A' : '#fff', border:'1px solid #EAF5EF', borderRadius:10, padding:'12px 14px' }}>
              <div style={{ fontSize:9, color: s.featured ? '#ffffff60' : '#6B9080', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:700, color: s.featured ? '#fff' : '#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid #EAF5EF', fontSize:12, fontWeight:700, color:'#0B1E16' }}>Agenda de hoy</div>
          <div style={{ padding:'8px 12px', display:'flex', flexDirection:'column', gap:6 }}>
            {DATOS_DEMO.reservasHoy.map(r => {
              const s = ESTADO_STYLES[r.estado] || ESTADO_STYLES.confirmada;
              return (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:s.bg, borderRadius:8 }}>
                  <div style={{ width:3, height:28, borderRadius:2, background:s.color, flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#0B1E16', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.clientes.nombre}</div>
                    {!isSmall && <div style={{ fontSize:10, color:'#6B9080' }}>{r.servicios.nombre}</div>}
                  </div>
                  <div style={{ fontSize:10, fontFamily:'DM Mono, monospace', color:'#6B9080', flexShrink:0 }}>{r.hora_inicio}</div>
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={() => navigate('/login')}
          style={{ width:'100%', background:'#0A9E6E', color:'#fff', border:'none', padding:'12px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}>
          Crear mi cuenta gratis →
        </button>
      </div>
    </div>
  );

  const renderReservas = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <Topbar titulo="Reservas"/>
      <div style={{ padding:isSmall ? 10 : 20, display:'flex', flexDirection:'column', gap:10 }}>
        {DATOS_DEMO.reservasHoy.map(r => {
          const s = ESTADO_STYLES[r.estado] || ESTADO_STYLES.confirmada;
          return (
            <div key={r.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'12px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{r.clientes.nombre}</div>
                <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:s.bg, color:s.color, flexShrink:0, marginLeft:6 }}>{s.label}</span>
              </div>
              <div style={{ fontSize:11.5, color:'#6B9080', marginBottom:4 }}>{r.servicios.nombre}</div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:r.empleados.color }}/>
                <span style={{ fontSize:11, color:'#6B9080' }}>{r.empleados.nombre}</span>
                <span style={{ fontSize:11, color:'#A8C4B8', marginLeft:'auto', fontFamily:'DM Mono, monospace' }}>{r.hora_inicio}–{r.hora_fin}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderClientes = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <Topbar titulo="Clientes"/>
      <div style={{ padding:isSmall ? 10 : 20, display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { label:'Total', value: DATOS_DEMO.clientes.length },
            { label:'VIP',   value: DATOS_DEMO.clientes.filter(c=>c.tag==='vip').length },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ fontSize:9, color:'#6B9080', fontWeight:600, textTransform:'uppercase', marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>
        {DATOS_DEMO.clientes.map(c => {
          const t = TAG_STYLES[c.tag] || TAG_STYLES.regular;
          return (
            <div key={c.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {c.nombre[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'#0B1E16', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.nombre}</div>
                {!isSmall && <div style={{ fontSize:11, color:'#6B9080', fontFamily:'DM Mono, monospace' }}>{c.telefono}</div>}
              </div>
              <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:t.bg, color:t.color, flexShrink:0 }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderServicios = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <Topbar titulo="Servicios"/>
      <div style={{ padding:isSmall ? 10 : 20, display:'flex', flexDirection:'column', gap:8 }}>
        {DATOS_DEMO.servicios.map(s => (
          <div key={s.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.nombre}</div>
              <div style={{ fontSize:11, color:'#6B9080' }}>{s.duracion} min</div>
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace', flexShrink:0 }}>{s.precio}€</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmpleados = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <Topbar titulo="Empleados"/>
      <div style={{ padding:isSmall ? 10 : 20, display:'flex', flexDirection:'column', gap:10 }}>
        {DATOS_DEMO.empleados.map(emp => (
          <div key={emp.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, overflow:'hidden' }}>
            <div style={{ background:emp.color+'18', padding:'12px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid #EAF5EF' }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:emp.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {emp.nombre[0]}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.nombre}</div>
                <div style={{ fontSize:11, color:'#6B9080' }}>Empleada activa</div>
              </div>
            </div>
            <div style={{ padding:'10px 14px', display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                <span style={{ color:'#6B9080' }}>Comisión</span>
                <span style={{ fontWeight:600, color:'#0A9E6E' }}>{emp.tipo_comision === 'porcentaje' ? `${emp.comision_valor}%` : `${emp.comision_valor}€/cita`}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                <span style={{ color:'#6B9080' }}>Citas este mes</span>
                <span style={{ fontWeight:600, color:'#0B1E16' }}>{emp.citas}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                <span style={{ color:'#6B9080' }}>Facturado</span>
                <span style={{ fontWeight:700, color:'#0A9E6E' }}>{emp.facturado}€</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStock = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <Topbar titulo="Stock"/>
      <div style={{ padding:isSmall ? 10 : 20, display:'flex', flexDirection:'column', gap:8 }}>
        {DATOS_DEMO.stock.map(p => {
          const sinStock = p.stock_actual === 0;
          const bajo = p.stock_actual > 0 && p.stock_actual <= p.stock_minimo;
          return (
            <div key={p.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'#0B1E16', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nombre}</div>
                <div style={{ fontSize:11, color:'#6B9080' }}>{p.categoria}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, flexShrink:0 }}>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:'DM Mono, monospace', color: sinStock ? '#EF4444' : bajo ? '#F59E0B' : '#0A9E6E' }}>
                  {p.stock_actual} uds
                </span>
                {sinStock && <span style={{ fontSize:9, background:'#FEF2F2', color:'#EF4444', padding:'1px 5px', borderRadius:8, fontWeight:600 }}>Sin stock</span>}
                {bajo && <span style={{ fontSize:9, background:'#FFF8E7', color:'#F59E0B', padding:'1px 5px', borderRadius:8, fontWeight:600 }}>Bajo</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renders = {
    dashboard: renderDashboard,
    reservas:  renderReservas,
    clientes:  renderClientes,
    servicios: renderServicios,
    empleados: renderEmpleados,
    stock:     renderStock,
  };

  // ── LAYOUT ÚNICO — sidebar siempre visible ─────────────────
  return (
    <div style={{ display:'flex', height:'100vh', background:'#F4FAF7', fontFamily:'DM Sans, system-ui, sans-serif', overflow:'hidden' }}>

      {/* Sidebar — se estrecha en móvil pero siempre visible */}
      <div style={{ background:'#063D2A', width:sidebarW, height:'100vh', display:'flex', flexDirection:'column', flexShrink:0, transition:'width 0.2s' }}>

        {/* Logo */}
        <div style={{ padding: isSmall ? '20px 0 12px' : '20px 16px 12px', display:'flex', alignItems:'center', justifyContent: isSmall ? 'center' : 'flex-start', gap:8 }}>
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
            <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
              stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="32" r="4.5" fill="white"/>
            <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
          </svg>
          {!isSmall && (
            <>
              <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Reservly</span>
              <span style={{ fontSize:8, background:'#0A9E6E', color:'#fff', padding:'2px 5px', borderRadius:8, fontWeight:700 }}>DEMO</span>
            </>
          )}
        </div>

        {/* Nav items */}
        <div style={{ padding: isSmall ? '0 6px' : '0 8px', flex:1 }}>
          {NAV_ITEMS.map(item => (
            <div key={item.id} onClick={() => setPantalla(item.id)}
              style={{
                display:'flex', alignItems:'center', gap: isSmall ? 0 : 10,
                justifyContent: isSmall ? 'center' : 'flex-start',
                padding: isSmall ? '10px 0' : '8px 10px',
                borderRadius:8, cursor:'pointer', marginBottom:2,
                background: pantalla===item.id ? '#0A9E6E' : 'transparent',
                color: pantalla===item.id ? '#fff' : '#ffffff70',
                fontSize:13,
              }}>
              <span style={{ fontSize: isSmall ? 18 : 16 }}>{item.emoji}</span>
              {!isSmall && <span style={{ fontWeight: pantalla===item.id ? 600 : 400 }}>{item.label}</span>}
            </div>
          ))}
        </div>

        {/* Footer sidebar */}
        {!isSmall && (
          <div style={{ padding:'12px', borderTop:'1px solid #ffffff10' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>P</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Peluquería Demo</div>
                <div style={{ fontSize:9, color:'#0A9E6E' }}>Plan Pro · Demo</div>
              </div>
            </div>
            <button onClick={() => navigate('/login')}
              style={{ width:'100%', background:'#0A9E6E', border:'none', borderRadius:7, padding:'7px', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer' }}>
              Crear cuenta gratis →
            </button>
          </div>
        )}

        {isSmall && (
          <div style={{ padding:'12px 0', borderTop:'1px solid #ffffff10', display:'flex', justifyContent:'center' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' }}>P</div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', minWidth:0 }}>
        {renders[pantalla] ? renders[pantalla]() : renderDashboard()}
      </div>
    </div>
  );
}