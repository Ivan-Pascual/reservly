import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function Comisiones() {
  const { negocio } = useNegocio();
  const isMobile = useIsMobile();
  const [empleados, setEmpleados] = useState([]);
  const [comisiones, setComisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}`;
  });

  useEffect(() => {
    if (!negocio) return;
    fetchData();
  }, [negocio, mes]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    const inicioMes = `${mes}-01`;
    const finMes = new Date(mes.split('-')[0], mes.split('-')[1], 0).toISOString().split('T')[0];

    const { data: emps } = await supabase
      .from('empleados').select('*')
      .eq('negocio_id', negocio.id).eq('activo', true);

    const { data: reservas } = await supabase
      .from('reservas').select('*, servicios(precio), empleados(id)')
      .eq('negocio_id', negocio.id).eq('estado', 'completada')
      .gte('fecha', inicioMes).lte('fecha', finMes);

    const { data: tpvData } = await supabase
      .from('tpv').select('importe, reserva_id')
      .eq('negocio_id', negocio.id)
      .gte('created_at', inicioMes + 'T00:00:00')
      .lte('created_at', finMes + 'T23:59:59');

    if (emps) {
      const resumen = emps.map(e => {
        const resEmp = (reservas || []).filter(r => r.empleado_id === e.id);
        const citas = resEmp.length;
        const facturado = resEmp.reduce((a, r) => {
          const tpv = (tpvData || []).find(t => t.reserva_id === r.id);
          return a + (tpv?.importe || r.servicios?.precio || 0);
        }, 0);
        let comision = 0;
        if (e.tipo_comision === 'porcentaje') comision = Math.round(facturado * e.comision_valor / 100 * 100) / 100;
        if (e.tipo_comision === 'fijo') comision = e.comision_valor * citas;
        return { ...e, citas, facturado, comision };
      });
      setEmpleados(resumen);
      setComisiones(resumen.filter(e => e.tipo_comision !== 'ninguna'));
    }
    setLoading(false);
  };

  const pad = isMobile ? 16 : 32;
  const totalComisiones = comisiones.reduce((a, e) => a + e.comision, 0);
  const totalFacturado = empleados.reduce((a, e) => a + e.facturado, 0);

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Comisiones</div>
        <div style={{ marginLeft:'auto' }}>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            style={{ padding:'6px 10px', border:'1px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none', background:'#F4FAF7' }}/>
        </div>
      </div>

      <div style={{ padding:pad, display:'flex', flexDirection:'column', gap:16 }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
          {[
            { label:'Total comisiones', value: `${totalComisiones.toFixed(2)} EUR`, featured: true },
            { label:'Total facturado',  value: `${totalFacturado.toFixed(2)} EUR` },
            { label:'Empleados activos', value: empleados.length },
            { label:'Con comisión',     value: comisiones.length },
          ].map(s => (
            <div key={s.label} style={{ background: s.featured ? '#063D2A' : '#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color: s.featured ? '#ffffff60' : '#6B9080', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:18, fontWeight:700, color: s.featured ? '#fff' : '#0B1E16', fontFamily:'DM Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Lista empleados */}
        {empleados.length > 0 ? (
          isMobile ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {empleados.map(e => (
                <div key={e.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:e.color||'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#fff' }}>
                      {e.nombre[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>{e.nombre}</div>
                      <div style={{ fontSize:12, color:'#6B9080' }}>
                        {e.tipo_comision === 'ninguna' ? 'Sin comisión' :
                         e.tipo_comision === 'porcentaje' ? `${e.comision_valor}%` :
                         `${e.comision_valor} EUR/cita`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                    {[
                      { label:'Citas', value: e.citas },
                      { label:'Facturado', value: `${e.facturado.toFixed(2)} EUR` },
                      { label:'Comisión', value: `${e.comision.toFixed(2)} EUR`, highlight: e.comision > 0 },
                    ].map(d => (
                      <div key={d.label} style={{ background:'#F4FAF7', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                        <div style={{ fontSize:10, color:'#6B9080', fontWeight:600, textTransform:'uppercase', marginBottom:3 }}>{d.label}</div>
                        <div style={{ fontSize:14, fontWeight:700, color: d.highlight ? '#0A9E6E' : '#0B1E16', fontFamily:'DM Mono, monospace' }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
                {['Empleado','Tipo comisión','Citas','Facturado','Comisión'].map(h=>(
                  <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
                ))}
              </div>
              {empleados.map((e, i) => (
                <div key={e.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'14px 20px', borderBottom: i<empleados.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center' }}
                  onMouseEnter={ev=>ev.currentTarget.style.background='#F4FAF7'}
                  onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:e.color||'#0A9E6E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
                      {e.nombre[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{e.nombre}</span>
                  </div>
                  <div style={{ fontSize:13, color:'#6B9080' }}>
                    {e.tipo_comision === 'ninguna' ? '—' :
                     e.tipo_comision === 'porcentaje' ? `${e.comision_valor}%` :
                     `${e.comision_valor} EUR/cita`}
                  </div>
                  <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#0B1E16' }}>{e.citas}</div>
                  <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', color:'#0B1E16' }}>{e.facturado.toFixed(2)} EUR</div>
                  <div style={{ fontSize:14, fontFamily:'DM Mono, monospace', fontWeight:700, color: e.comision > 0 ? '#0A9E6E' : '#A8C4B8' }}>
                    {e.comision.toFixed(2)} EUR
                  </div>
                </div>
              ))}
              {/* Total */}
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'12px 20px', background:'#F4FAF7', borderTop:'2px solid #EAF5EF', gap:12, alignItems:'center' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#0B1E16' }}>Total</div>
                <div/>
                <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', fontWeight:700 }}>{empleados.reduce((a,e)=>a+e.citas,0)}</div>
                <div style={{ fontSize:13, fontFamily:'DM Mono, monospace', fontWeight:700 }}>{totalFacturado.toFixed(2)} EUR</div>
                <div style={{ fontSize:14, fontFamily:'DM Mono, monospace', fontWeight:700, color:'#0A9E6E' }}>{totalComisiones.toFixed(2)} EUR</div>
              </div>
            </div>
          )
        ) : (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'60px 40px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⏱</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Sin empleados aún</div>
            <div style={{ fontSize:13, color:'#6B9080' }}>Añade empleados con comisión para verlas aquí</div>
          </div>
        )}

      </div>
    </div>
  );
}