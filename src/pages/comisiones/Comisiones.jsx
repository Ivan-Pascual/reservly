import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';

const PERIODOS = ['Hoy', 'Este mes', 'Este año'];

export default function Comisiones() {
  const { negocio } = useNegocio();
  const [empleados, setEmpleados] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [periodo, setPeriodo] = useState('Este mes');
  const [editando, setEditando] = useState({});

  useEffect(() => {
    if (!negocio) return;
    fetchData();
  }, [negocio, periodo]);

  const fetchData = async () => {
    setLoading(true);

    // Fechas según periodo
    const hoy = new Date();
    let fechaInicio;
    if (periodo === 'Hoy') {
      fechaInicio = hoy.toISOString().split('T')[0];
    } else if (periodo === 'Este mes') {
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    } else {
      fechaInicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
    }
    const fechaFin = hoy.toISOString().split('T')[0];

    // Empleados
    const { data: emps } = await supabase
      .from('empleados')
      .select('*')
      .eq('negocio_id', negocio.id)
      .eq('activo', true);

    if (!emps) { setLoading(false); return; }
    setEmpleados(emps);
    setEditando(Object.fromEntries(emps.map(e => [e.id, { tipo_comision: e.tipo_comision, comision_valor: e.comision_valor }])));

    // Reservas completadas en el periodo con servicios
    const { data: reservas } = await supabase
      .from('reservas')
      .select('*, servicios(nombre, precio), empleados(id)')
      .eq('negocio_id', negocio.id)
      .eq('estado', 'completada')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);

    // Calcular resumen por empleado
    const resumenEmps = emps.map(emp => {
      const reservasEmp = (reservas || []).filter(r => r.empleados?.id === emp.id);
      const facturado = reservasEmp.reduce((a, r) => a + (r.precio_final || r.servicios?.precio || 0), 0);
      const citas = reservasEmp.length;
      const comision = emp.tipo_comision === 'porcentaje'
        ? Math.round(facturado * emp.comision_valor / 100 * 100) / 100
        : emp.tipo_comision === 'fijo'
        ? emp.comision_valor * citas
        : 0;

      // Desglose por servicio
      const desglose = {};
      reservasEmp.forEach(r => {
        const nombre = r.servicios?.nombre || 'Sin servicio';
        const precio = r.precio_final || r.servicios?.precio || 0;
        if (!desglose[nombre]) desglose[nombre] = { citas: 0, facturado: 0 };
        desglose[nombre].citas += 1;
        desglose[nombre].facturado += precio;
      });

      return { ...emp, citas, facturado, comision, desglose: Object.entries(desglose) };
    });

    setResumen(resumenEmps);
    setLoading(false);
  };

  const guardarComisiones = async () => {
    setSaving(true);
    for (const empId of Object.keys(editando)) {
      await supabase.from('empleados').update({
        tipo_comision:  editando[empId].tipo_comision,
        comision_valor: parseFloat(editando[empId].comision_valor) || 0,
      }).eq('id', empId);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    fetchData();
  };

  const totalFacturado  = resumen.reduce((a, e) => a + e.facturado, 0);
  const totalComisiones = resumen.reduce((a, e) => a + e.comision, 0);
  const totalCitas      = resumen.reduce((a, e) => a + e.citas, 0);
  const ticketMedio     = totalCitas > 0 ? Math.round(totalFacturado / totalCitas) : 0;

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 32px', height:60, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Comisiones</div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          {saved && <span style={{ fontSize:13, color:'#0A9E6E', fontWeight:600 }}>✓ Guardado</span>}
          <button onClick={guardarComisiones} disabled={saving}
            style={{ background: saving ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      </div>

      <div style={{ padding:32, display:'flex', flexDirection:'column', gap:20 }}>

        {/* Periodo */}
        <div style={{ display:'flex', background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden', width:'fit-content' }}>
          {PERIODOS.map(p => (
            <button key={p} onClick={() => setPeriodo(p)} style={{
              padding:'7px 18px', fontSize:12.5, fontWeight:500,
              color: periodo===p ? '#fff' : '#6B9080',
              background: periodo===p ? '#0A9E6E' : 'transparent',
              border:'none', borderRight:'1px solid #D6EDE5', cursor:'pointer',
            }}>{p}</button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { label:'Facturación total',  value: totalFacturado.toFixed(2) + ' EUR',  color:'#0B1E16' },
            { label:'Total comisiones',   value: totalComisiones.toFixed(2) + ' EUR', color:'#0A9E6E' },
            { label:'Citas completadas',  value: totalCitas,                           color:'#0B1E16' },
            { label:'Ticket medio',       value: ticketMedio + ' EUR',                 color:'#0B1E16' },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ fontSize:11, color:'#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:700, color:s.color, fontFamily:'DM Mono, monospace', letterSpacing:-0.5 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}>

          {/* Tabla empleados */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {resumen.length > 0 ? (
              <>
                <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 100px', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
                    {['Empleado','Citas','Facturado','Tipo','Ocupación','Comisión'].map(h => (
                      <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
                    ))}
                  </div>

                  {resumen.map((e, i) => (
                    <div key={e.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 100px', padding:'16px 20px', borderBottom: i<resumen.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:e.color||'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
                          {e.nombre[0]}
                        </div>
                        <div>
                          <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{e.nombre}</div>
                          <div style={{ fontSize:11, color:'#6B9080' }}>
                            {e.tipo_comision === 'porcentaje' ? `${e.comision_valor}% sobre servicio` :
                             e.tipo_comision === 'fijo' ? `${e.comision_valor} EUR/cita` : 'Sin comisión'}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#0B1E16' }}>{e.citas}</div>
                      <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', fontWeight:700, color:'#0A9E6E' }}>{e.facturado.toFixed(2)} EUR</div>
                      <div>
                        <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20,
                          background: e.tipo_comision==='porcentaje' ? '#EFF6FF' : e.tipo_comision==='fijo' ? '#F5F3FF' : '#F1F5F9',
                          color: e.tipo_comision==='porcentaje' ? '#1E40AF' : e.tipo_comision==='fijo' ? '#5B21B6' : '#6B9080',
                        }}>
                          {e.tipo_comision==='porcentaje' ? `${e.comision_valor}%` :
                           e.tipo_comision==='fijo' ? `${e.comision_valor}€/cita` : 'Sin comisión'}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:'#6B9080', marginBottom:3, display:'flex', justifyContent:'space-between' }}>
                          <span>Ocupación</span>
                          <span style={{ fontFamily:'DM Mono, monospace', fontWeight:600, color:'#0B1E16' }}>{e.citas} citas</span>
                        </div>
                        <div style={{ height:6, background:'#EAF5EF', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ width:`${Math.min(100, e.citas * 5)}%`, height:'100%', background:e.color||'#0A9E6E', borderRadius:3 }}/>
                        </div>
                      </div>
                      <div style={{ fontSize:16, fontWeight:700, fontFamily:'DM Mono, monospace', color:'#0A9E6E' }}>
                        {e.comision.toFixed(2)} EUR
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 100px', padding:'14px 20px', gap:12, background:'#F4FAF7', borderTop:'2px solid #D6EDE5', alignItems:'center' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16' }}>TOTAL {periodo.toUpperCase()}</div>
                    <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', fontWeight:700 }}>{totalCitas}</div>
                    <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', fontWeight:700, color:'#0A9E6E' }}>{totalFacturado.toFixed(2)} EUR</div>
                    <div/><div/>
                    <div style={{ fontSize:17, fontWeight:700, fontFamily:'DM Mono, monospace', color:'#0A9E6E' }}>{totalComisiones.toFixed(2)} EUR</div>
                  </div>
                </div>

                {/* Desglose por empleado */}
                {resumen.map(e => e.desglose.length > 0 && (
                  <div key={e.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
                    <div style={{ padding:'14px 20px', borderBottom:'1px solid #EAF5EF', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:e.color||'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' }}>{e.nombre[0]}</div>
                      <div style={{ fontSize:13.5, fontWeight:700, color:'#0B1E16' }}>Desglose — {e.nombre}</div>
                      <div style={{ marginLeft:'auto', fontSize:13, color:'#6B9080' }}>Comisión total: <strong style={{ color:'#0A9E6E' }}>{e.comision.toFixed(2)} EUR</strong></div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 100px 100px', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
                      {['Servicio','Citas','Facturado','Comisión'].map(h => (
                        <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.4px' }}>{h}</div>
                      ))}
                    </div>
                    {e.desglose.map(([nombre, data], j) => (
                      <div key={j} style={{ display:'grid', gridTemplateColumns:'1fr 80px 100px 100px', padding:'12px 20px', borderBottom:'1px solid #EAF5EF', gap:12, alignItems:'center' }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{nombre}</div>
                        <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{data.citas}</div>
                        <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#6B9080' }}>{data.facturado.toFixed(2)} EUR</div>
                        <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', fontWeight:700, color:'#0A9E6E' }}>
                          {e.tipo_comision === 'porcentaje'
                            ? (data.facturado * e.comision_valor / 100).toFixed(2)
                            : e.tipo_comision === 'fijo'
                            ? (e.comision_valor * data.citas).toFixed(2)
                            : '0.00'} EUR
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            ) : (
              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'60px 40px', textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>⏱</div>
                <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Sin datos aún</div>
                <div style={{ fontSize:13, color:'#6B9080' }}>Las comisiones aparecerán cuando haya reservas completadas</div>
              </div>
            )}
          </div>

          {/* Config comisiones */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #EAF5EF', fontSize:13, fontWeight:700, color:'#0B1E16' }}>
                Configurar comisiones
              </div>
              {empleados.map(e => (
                <div key={e.id} style={{ padding:'14px 18px', borderBottom:'1px solid #EAF5EF' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:e.color||'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff' }}>{e.nombre[0]}</div>
                    <span style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>{e.nombre}</span>
                  </div>
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:4 }}>Tipo</div>
                    <select value={editando[e.id]?.tipo_comision || 'ninguna'}
                      onChange={ev => setEditando(p => ({ ...p, [e.id]: { ...p[e.id], tipo_comision: ev.target.value } }))}
                      style={{ width:'100%', padding:'7px 10px', border:'1px solid #D6EDE5', borderRadius:8, background:'#F4FAF7', fontSize:12.5, fontFamily:'DM Sans, sans-serif' }}>
                      <option value="ninguna">Sin comisión</option>
                      <option value="porcentaje">Porcentaje sobre servicio</option>
                      <option value="fijo">Cantidad fija por cita</option>
                    </select>
                  </div>
                  {editando[e.id]?.tipo_comision !== 'ninguna' && (
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:4 }}>
                        {editando[e.id]?.tipo_comision === 'porcentaje' ? 'Porcentaje (%)' : 'EUR por cita'}
                      </div>
                      <input type="number" value={editando[e.id]?.comision_valor || 0}
                        onChange={ev => setEditando(p => ({ ...p, [e.id]: { ...p[e.id], comision_valor: ev.target.value } }))}
                        style={{ width:'100%', padding:'7px 10px', border:'1px solid #D6EDE5', borderRadius:8, background:'#F4FAF7', fontSize:13, fontFamily:'DM Mono, monospace', outline:'none' }}/>
                    </div>
                  )}
                </div>
              ))}
              <div style={{ padding:'14px 18px' }}>
                <button onClick={guardarComisiones} disabled={saving}
                  style={{ width:'100%', background: saving ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', padding:10, borderRadius:8, fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Guardando...' : 'Guardar configuración'}
                </button>
              </div>
            </div>

            <div style={{ background:'#063D2A', borderRadius:14, padding:18, display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Exportar informe</div>
              <div style={{ fontSize:12, color:'#ffffff60' }}>Para nóminas o contabilidad</div>
              <button style={{ padding:'9px 14px', background:'#0A9E6E', color:'#fff', border:'none', borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
                📄 Exportar PDF
              </button>
              <button style={{ padding:'9px 14px', background:'#ffffff15', color:'#fff', border:'none', borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
                📊 Exportar Excel
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}