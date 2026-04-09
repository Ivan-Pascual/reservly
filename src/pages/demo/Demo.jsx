import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DATOS_DEMO = {
  negocio: { nombre: 'Peluquería Demo', slug: 'demo', telefono: '+34 600 000 000', direccion: 'Calle Mayor 1, Huesca' },
  reservasHoy: [
    { id:1, clientes:{ nombre:'Carmen López' }, servicios:{ nombre:'Corte y peinado' }, empleados:{ nombre:'María García', color:'#0A9E6E' }, hora_inicio:'09:00', hora_fin:'10:00', estado:'confirmada' },
    { id:2, clientes:{ nombre:'Ana Martínez' }, servicios:{ nombre:'Tinte' }, empleados:{ nombre:'Laura Pérez', color:'#3B82F6' }, hora_inicio:'10:30', hora_fin:'12:00', estado:'confirmada' },
    { id:3, clientes:{ nombre:'Rosa Fernández' }, servicios:{ nombre:'Corte' }, empleados:{ nombre:'María García', color:'#0A9E6E' }, hora_inicio:'12:00', hora_fin:'12:45', estado:'pendiente' },
    { id:4, clientes:{ nombre:'Julia Sánchez' }, servicios:{ nombre:'Manicura' }, empleados:{ nombre:'Laura Pérez', color:'#3B82F6' }, hora_inicio:'16:00', hora_fin:'17:00', estado:'confirmada' },
  ],
  stats: { hoy:4, mes:87, pendientes:3, canceladas:1, facturacionHoy:156, facturacionMes:3240, facturacionTotal:18750, clientesTotal:142, clientesMes:8 },
  clientes: [
    { id:1, nombre:'Carmen López', telefono:'+34 612 345 678', email:'carmen@email.com', tag:'vip', sexo:'mujer' },
    { id:2, nombre:'Ana Martínez', telefono:'+34 623 456 789', email:'ana@email.com', tag:'regular', sexo:'mujer' },
    { id:3, nombre:'Pedro García', telefono:'+34 634 567 890', email:'pedro@email.com', tag:'nuevo', sexo:'hombre' },
    { id:4, nombre:'Rosa Fernández', telefono:'+34 645 678 901', email:'rosa@email.com', tag:'regular', sexo:'mujer' },
    { id:5, nombre:'Julia Sánchez', telefono:'+34 656 789 012', email:'julia@email.com', tag:'vip', sexo:'mujer' },
  ],
  servicios: [
    { id:1, nombre:'Corte de pelo', duracion:45, precio:25, categoria:'Corte', activo:true },
    { id:2, nombre:'Tinte', duracion:90, precio:55, categoria:'Color', activo:true },
    { id:3, nombre:'Peinado', duracion:60, precio:35, categoria:'Peinado', activo:true },
    { id:4, nombre:'Manicura', duracion:60, precio:30, categoria:'Tratamiento', activo:true },
    { id:5, nombre:'Tratamiento hidratante', duracion:45, precio:40, categoria:'Tratamiento', activo:true },
  ],
  empleados: [
    { id:1, nombre:'María García', color:'#0A9E6E', tipo_comision:'porcentaje', comision_valor:10 },
    { id:2, nombre:'Laura Pérez', color:'#3B82F6', tipo_comision:'fijo', comision_valor:5 },
  ],
  stock: [
    { id:1, nombre:'Champú hidratante', codigo_barras:'8410261099019', categoria:'Champús', stock_actual:12, stock_minimo:5, precio_venta:14.90, precio_coste:7.50 },
    { id:2, nombre:'Tinte rubio', codigo_barras:'3474630561960', categoria:'Tintes', stock_actual:3, stock_minimo:5, precio_venta:8.90, precio_coste:4.20 },
    { id:3, nombre:'Mascarilla reparadora', codigo_barras:'8005610546483', categoria:'Tratamientos', stock_actual:0, stock_minimo:3, precio_venta:22.50, precio_coste:11.00 },
    { id:4, nombre:'Acondicionador', codigo_barras:'8410261099026', categoria:'Champús', stock_actual:8, stock_minimo:4, precio_venta:12.90, precio_coste:6.00 },
  ],
};

const TAG_STYLES = {
  vip:      { bg:'#F5F3FF', color:'#8B5CF6', label:'⭐ VIP'  },
  regular:  { bg:'#E8F7F2', color:'#063D2A', label:'Regular' },
  nuevo:    { bg:'#FFF8E7', color:'#92400E', label:'Nuevo'   },
};

const ESTADO_STYLES = {
  confirmada: { bg:'#E8F7F2', color:'#063D2A', label:'Confirmada' },
  pendiente:  { bg:'#FFF8E7', color:'#92400E', label:'Pendiente'  },
};

export default function Demo() {
  const navigate = useNavigate();
  const [pantalla, setPantalla] = useState('dashboard');
  const [hora, setHora] = useState(new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => setHora(new Date().getHours()), 60000);
    return () => clearInterval(interval);
  }, []);

  const saludo = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

  const nav = (pantalla) => (
    <div style={{ background:'#063D2A', width:220, height:'100vh', display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ padding:'24px 20px 16px', display:'flex', alignItems:'center', gap:8 }}>
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
            stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="21" cy="32" r="4.5" fill="white"/>
          <circle cx="21" cy="32" r="2.2" fill="#063D2A"/>
        </svg>
        <span style={{ fontSize:16, fontWeight:700, color:'#fff' }}>Reservly</span>
        <span style={{ fontSize:9, background:'#0A9E6E', color:'#fff', padding:'2px 6px', borderRadius:10, fontWeight:700, marginLeft:2 }}>DEMO</span>
      </div>
      <div style={{ padding:'0 10px', flex:1 }}>
        {[
          { id:'dashboard',   emoji:'⊞',  label:'Inicio'       },
          { id:'reservas',    emoji:'📅', label:'Reservas'     },
          { id:'clientes',    emoji:'👤', label:'Clientes'     },
          { id:'servicios',   emoji:'✂️', label:'Servicios'    },
          { id:'empleados',   emoji:'👥', label:'Empleados'    },
          { id:'stock',       emoji:'📦', label:'Stock'        },
        ].map(item => (
          <div key={item.id} onClick={() => setPantalla(item.id)}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, cursor:'pointer', marginBottom:2,
              background: pantalla===item.id ? '#0A9E6E' : 'transparent',
              color: pantalla===item.id ? '#fff' : '#ffffff80',
              fontSize:13.5, fontWeight: pantalla===item.id ? 600 : 500,
            }}>
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding:14, borderTop:'1px solid #ffffff10' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>P</div>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>Peluquería Demo</div>
            <div style={{ fontSize:10, color:'#0A9E6E' }}>Plan Solo · Demo</div>
          </div>
        </div>
        <button onClick={() => navigate('/login')}
          style={{ width:'100%', background:'#0A9E6E', border:'none', borderRadius:8, padding:'8px', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          Crear mi cuenta gratis →
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 28px', height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>Inicio</div>
        <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#92400E', fontWeight:600 }}>
          👁️ Modo demo — datos de ejemplo
        </div>
        <div style={{ marginLeft:'auto' }}>
          <button style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}
            onClick={() => navigate('/login')}>
            Crear cuenta gratis →
          </button>
        </div>
      </div>
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#0B1E16', margin:0 }}>{saludo}, Peluquería Demo 👋</h2>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:8 }}>Reservas</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {[
              { label:'Citas hoy',  value: DATOS_DEMO.stats.hoy,        featured:true },
              { label:'Este mes',   value: DATOS_DEMO.stats.mes },
              { label:'Pendientes', value: DATOS_DEMO.stats.pendientes },
              { label:'Canceladas', value: DATOS_DEMO.stats.canceladas },
            ].map(s => (
              <div key={s.label} style={{ background: s.featured ? '#063D2A' : '#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
                <div style={{ fontSize:11, color: s.featured ? '#ffffff60' : '#6B9080', fontWeight:600, textTransform:'uppercase', marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:28, fontWeight:700, color: s.featured ? '#fff' : '#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:8 }}>Facturación</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', marginBottom:8 }}>Hoy</div>
              <div style={{ fontSize:22, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>{DATOS_DEMO.stats.facturacionHoy.toFixed(2)}</div>
              <div style={{ fontSize:11, color:'#6B9080', marginTop:4 }}>EUR</div>
            </div>
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', marginBottom:8 }}>Este mes</div>
              <div style={{ fontSize:22, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>{DATOS_DEMO.stats.facturacionMes.toFixed(2)}</div>
              <div style={{ fontSize:11, color:'#6B9080', marginTop:4 }}>EUR</div>
            </div>
            <div style={{ background:'#063D2A', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color:'#ffffff60', fontWeight:600, textTransform:'uppercase', marginBottom:8 }}>Total acumulado</div>
              <div style={{ fontSize:22, fontWeight:700, color:'#fff', fontFamily:'DM Mono, monospace' }}>{DATOS_DEMO.stats.facturacionTotal.toFixed(2)}</div>
              <div style={{ fontSize:11, color:'#0A9E6E', marginTop:4 }}>EUR</div>
            </div>
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', marginBottom:8 }}>Clientes</div>
              <div style={{ fontSize:28, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{DATOS_DEMO.stats.clientesTotal}</div>
              <div style={{ fontSize:11, color:'#6B9080', marginTop:4 }}>+{DATOS_DEMO.stats.clientesMes} este mes</div>
            </div>
          </div>
        </div>
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAF5EF', fontSize:13, fontWeight:700, color:'#0B1E16' }}>Agenda de hoy</div>
          <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:8 }}>
            {DATOS_DEMO.reservasHoy.map(r => {
              const s = ESTADO_STYLES[r.estado] || ESTADO_STYLES.confirmada;
              return (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:s.bg, borderRadius:8 }}>
                  <div style={{ width:3, height:32, borderRadius:2, background:s.color, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{r.clientes.nombre}</div>
                    <div style={{ fontSize:11.5, color:'#6B9080' }}>{r.servicios.nombre} · {r.empleados.nombre}</div>
                  </div>
                  <div style={{ fontSize:11, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{r.hora_inicio}–{r.hora_fin}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientes = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 28px', height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>Clientes</div>
        <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#92400E', fontWeight:600 }}>👁️ Demo</div>
      </div>
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {[
            { label:'Total', value: DATOS_DEMO.clientes.length },
            { label:'VIP', value: DATOS_DEMO.clientes.filter(c=>c.tag==='vip').length },
            { label:'Regulares', value: DATOS_DEMO.clientes.filter(c=>c.tag==='regular').length },
            { label:'Nuevos', value: DATOS_DEMO.clientes.filter(c=>c.tag==='nuevo').length },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:24, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
            {['Cliente','Teléfono','Sexo','Etiqueta'].map(h => (
              <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase' }}>{h}</div>
            ))}
          </div>
          {DATOS_DEMO.clientes.map((c, i) => {
            const t = TAG_STYLES[c.tag] || TAG_STYLES.regular;
            return (
              <div key={c.id} style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr', padding:'12px 20px', borderBottom: i<DATOS_DEMO.clientes.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
                    {c.nombre[0]}
                  </div>
                  <span style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{c.nombre}</span>
                </div>
                <div style={{ fontSize:12.5, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{c.telefono}</div>
                <div style={{ fontSize:12.5, color:'#6B9080', textTransform:'capitalize' }}>{c.sexo}</div>
                <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:t.bg, color:t.color, width:'fit-content' }}>{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderServicios = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 28px', height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>Servicios</div>
        <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#92400E', fontWeight:600 }}>👁️ Demo</div>
      </div>
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
            {['Servicio','Categoría','Duración','Precio'].map(h => (
              <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase' }}>{h}</div>
            ))}
          </div>
          {DATOS_DEMO.servicios.map((s, i) => (
            <div key={s.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', padding:'12px 20px', borderBottom: i<DATOS_DEMO.servicios.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center' }}>
              <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{s.nombre}</div>
              <div style={{ fontSize:12, color:'#6B9080' }}>{s.categoria}</div>
              <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{s.duracion} min</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0A9E6E', fontFamily:'DM Mono, monospace' }}>{s.precio} EUR</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStock = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 28px', height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>Stock</div>
        <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#92400E', fontWeight:600 }}>👁️ Demo</div>
      </div>
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 0.8fr 0.8fr', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
            {['Producto','Categoría','Stock','Mín.','Precio'].map(h => (
              <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase' }}>{h}</div>
            ))}
          </div>
          {DATOS_DEMO.stock.map((p, i) => {
            const stockOk = p.stock_actual > p.stock_minimo;
            const sinStock = p.stock_actual === 0;
            return (
              <div key={p.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 0.8fr 0.8fr', padding:'12px 20px', borderBottom: i<DATOS_DEMO.stock.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{p.nombre}</div>
                  <div style={{ fontSize:11, color:'#A8C4B8', fontFamily:'DM Mono, monospace' }}>{p.codigo_barras}</div>
                </div>
                <div style={{ fontSize:12, color:'#6B9080' }}>{p.categoria}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:14, fontWeight:700, fontFamily:'DM Mono, monospace', color: sinStock ? '#EF4444' : !stockOk ? '#F59E0B' : '#0A9E6E' }}>
                    {p.stock_actual}
                  </span>
                  {sinStock && <span style={{ fontSize:10, background:'#FEF2F2', color:'#EF4444', padding:'1px 5px', borderRadius:10, fontWeight:600 }}>Sin stock</span>}
                  {!sinStock && !stockOk && <span style={{ fontSize:10, background:'#FFF8E7', color:'#F59E0B', padding:'1px 5px', borderRadius:10, fontWeight:600 }}>Bajo</span>}
                </div>
                <div style={{ fontSize:12.5, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{p.stock_minimo}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16', fontFamily:'DM Mono, monospace' }}>{p.precio_venta} EUR</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderReservas = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 28px', height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>Reservas</div>
        <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#92400E', fontWeight:600 }}>👁️ Demo</div>
      </div>
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1fr 1fr', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
            {['Cliente','Servicio','Empleado','Hora','Estado'].map(h => (
              <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase' }}>{h}</div>
            ))}
          </div>
          {DATOS_DEMO.reservasHoy.map((r, i) => {
            const s = ESTADO_STYLES[r.estado] || ESTADO_STYLES.confirmada;
            return (
              <div key={r.id} style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1fr 1fr', padding:'12px 20px', borderBottom: i<DATOS_DEMO.reservasHoy.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center' }}>
                <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{r.clientes.nombre}</div>
                <div style={{ fontSize:13, color:'#6B9080' }}>{r.servicios.nombre}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:r.empleados.color }}/>
                  <span style={{ fontSize:13, color:'#0B1E16' }}>{r.empleados.nombre}</span>
                </div>
                <div style={{ fontSize:12.5, fontFamily:'DM Mono, monospace', color:'#0B1E16' }}>{r.hora_inicio}</div>
                <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:s.bg, color:s.color, width:'fit-content' }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderEmpleados = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 28px', height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>Empleados</div>
        <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#92400E', fontWeight:600 }}>👁️ Demo</div>
      </div>
      <div style={{ padding:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {DATOS_DEMO.empleados.map(e => (
          <div key={e.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ background:e.color+'20', padding:'16px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid #EAF5EF' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:e.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' }}>
                {e.nombre[0]}
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>{e.nombre}</div>
                <div style={{ fontSize:11.5, color:'#6B9080' }}>Empleada activa</div>
              </div>
            </div>
            <div style={{ padding:'12px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'#6B9080' }}>Comisión</span>
                <span style={{ fontWeight:600, color:'#0A9E6E' }}>
                  {e.tipo_comision === 'porcentaje' ? `${e.comision_valor}%` : `${e.comision_valor} EUR/cita`}
                </span>
              </div>
            </div>
          </div>
        ))}
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

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F4FAF7' }}>
      {nav(pantalla)}
      {renders[pantalla] ? renders[pantalla]() : renderDashboard()}
    </div>
  );
}