import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';

const TIPOS = {
  cierre:     { label:'Cierre total',    bg:'#FEF2F2', color:'#EF4444', border:'#FECACA' },
  vacaciones: { label:'Vacaciones',      bg:'#FFF8E7', color:'#92400E', border:'#F5E4A0' },
  festivo:    { label:'Festivo especial',bg:'#EFF6FF', color:'#1E40AF', border:'#BFDBFE' },
  ausencia:   { label:'Ausencia parcial',bg:'#F5F3FF', color:'#5B21B6', border:'#DDD6FE' },
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['L','M','X','J','V','S','D'];

export default function Vacaciones() {
  const { negocio } = useNegocio();
  const [cierres, setCierres] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  const [form, setForm] = useState({
    tipo: 'cierre', empleado_id: '', fecha_inicio: '', fecha_fin: '', motivo: '',
  });

  useEffect(() => {
    if (!negocio) return;
    fetchData();
  }, [negocio]);

  const fetchData = async () => {
    const [cierresRes, empRes] = await Promise.all([
      supabase.from('cierres').select(`*, empleados(nombre, color)`)
        .eq('negocio_id', negocio.id).order('fecha_inicio'),
      supabase.from('empleados').select('id, nombre, color')
        .eq('negocio_id', negocio.id).eq('activo', true),
    ]);
    if (cierresRes.data) setCierres(cierresRes.data);
    if (empRes.data) setEmpleados(empRes.data);
    setLoading(false);
  };

  const guardarCierre = async () => {
    if (!form.fecha_inicio || !form.fecha_fin) return;
    if (form.fecha_fin < form.fecha_inicio) {
      alert('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('cierres').insert({
      negocio_id:   negocio.id,
      empleado_id:  form.empleado_id || null,
      tipo:         form.tipo,
      fecha_inicio: form.fecha_inicio,
      fecha_fin:    form.fecha_fin,
      motivo:       form.motivo || null,
    });
    if (!error) {
      setForm({ tipo:'cierre', empleado_id:'', fecha_inicio:'', fecha_fin:'', motivo:'' });
      fetchData();
    }
    setSaving(false);
  };

  const eliminarCierre = async (id) => {
    if (!window.confirm('¿Eliminar este cierre?')) return;
    await supabase.from('cierres').delete().eq('id', id);
    fetchData();
  };

  const getDiasCalendario = () => {
    const primerDia = new Date(anioActual, mesActual, 1);
    const ultimoDia = new Date(anioActual, mesActual + 1, 0);
    const diasPrevios = (primerDia.getDay() + 6) % 7;
    const dias = [];

    for (let i = diasPrevios; i > 0; i--) {
      dias.push({ fecha: new Date(anioActual, mesActual, 1 - i), actual: false });
    }
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push({ fecha: new Date(anioActual, mesActual, i), actual: true });
    }
    const restantes = 42 - dias.length;
    for (let i = 1; i <= restantes; i++) {
      dias.push({ fecha: new Date(anioActual, mesActual + 1, i), actual: false });
    }
    return dias;
  };

  const getTipoDia = (fecha) => {
    const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}-${String(fecha.getDate()).padStart(2,'0')}`;
    const hoy = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
    for (const cierre of cierres) {
      if (fechaStr >= cierre.fecha_inicio && fechaStr <= cierre.fecha_fin) {
        return cierre.tipo;
      }
    }
    if (fechaStr === hoy) return 'hoy';
    return null;
  };

  const dias = getDiasCalendario();

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:'0 32px', height:60, display:'flex', alignItems:'center' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Vacaciones y cierres</div>
      </div>

      <div style={{ padding:32, display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Calendario */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:15, fontWeight:700, color:'#0B1E16' }}>{MESES[mesActual]} {anioActual}</div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => {
                  if (mesActual === 0) { setMesActual(11); setAnioActual(a => a-1); }
                  else setMesActual(m => m-1);
                }} style={{ width:30, height:30, border:'1px solid #D6EDE5', borderRadius:8, background:'transparent', cursor:'pointer', color:'#6B9080', fontSize:14 }}>‹</button>
                <button onClick={() => {
                  if (mesActual === 11) { setMesActual(0); setAnioActual(a => a+1); }
                  else setMesActual(m => m+1);
                }} style={{ width:30, height:30, border:'1px solid #D6EDE5', borderRadius:8, background:'transparent', cursor:'pointer', color:'#6B9080', fontSize:14 }}>›</button>
              </div>
            </div>

            <div style={{ padding:'10px 20px', borderBottom:'1px solid #EAF5EF', display:'flex', gap:16, flexWrap:'wrap' }}>
              {Object.entries(TIPOS).map(([k, v]) => (
                <div key={k} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:'#6B9080' }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:v.bg, border:`1px solid ${v.border}` }}/>
                  {v.label}
                </div>
              ))}
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:'#6B9080' }}>
                <div style={{ width:10, height:10, borderRadius:3, background:'#0A9E6E' }}/>
                Hoy
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'8px 16px 4px' }}>
              {DIAS_SEMANA.map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'#A8C4B8', padding:'4px 0' }}>{d}</div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, padding:'0 16px 16px' }}>
              {dias.map((d, i) => {
                const tipo = getTipoDia(d.fecha);
                const esHoy = tipo === 'hoy';
                const tipoCierre = tipo && tipo !== 'hoy' ? TIPOS[tipo] : null;
                return (
                  <div key={i} style={{
                    aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, borderRadius:8, cursor:'pointer',
                    color: !d.actual ? '#D6EDE5' : esHoy ? '#fff' : tipoCierre ? tipoCierre.color : '#0B1E16',
                    background: esHoy ? '#0A9E6E' : tipoCierre ? tipoCierre.bg : 'transparent',
                    border: tipoCierre ? `1px solid ${tipoCierre.border}` : '1px solid transparent',
                    fontWeight: esHoy ? 700 : 400,
                  }}>
                    {d.fecha.getDate()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista cierres */}
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAF5EF', fontSize:14, fontWeight:700, color:'#0B1E16' }}>
              Cierres programados
            </div>
            {cierres.length > 0 ? cierres.map(c => {
              const t = TIPOS[c.tipo] || TIPOS.cierre;
              return (
                <div key={c.id} style={{ padding:'14px 20px', borderBottom:'1px solid #EAF5EF', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:t.bg, color:t.color }}>{t.label}</span>
                      {c.empleados && <span style={{ fontSize:11, color:'#6B9080' }}>· {c.empleados.nombre}</span>}
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#0B1E16' }}>
                      {c.fecha_inicio === c.fecha_fin ? c.fecha_inicio : `${c.fecha_inicio} — ${c.fecha_fin}`}
                    </div>
                    {c.motivo && <div style={{ fontSize:12, color:'#6B9080', marginTop:2 }}>{c.motivo}</div>}
                  </div>
                  <button onClick={() => eliminarCierre(c.id)}
                    style={{ background:'#FEF2F2', border:'none', color:'#EF4444', padding:'6px 10px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    Eliminar
                  </button>
                </div>
              );
            }) : (
              <div style={{ padding:'40px', textAlign:'center', color:'#A8C4B8' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🏖️</div>
                <div style={{ fontSize:14 }}>Sin cierres programados</div>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 18px', borderBottom:'1px solid #EAF5EF', fontSize:13, fontWeight:700, color:'#0B1E16' }}>
              Añadir cierre
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Tipo</div>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', background:'#F4FAF7' }}>
                  <option value="cierre">Cierre total del negocio</option>
                  <option value="vacaciones">Vacaciones de empleado</option>
                  <option value="festivo">Festivo especial</option>
                  <option value="ausencia">Ausencia parcial</option>
                </select>
              </div>

              {(form.tipo === 'vacaciones' || form.tipo === 'ausencia') && (
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Empleado</div>
                  <select value={form.empleado_id} onChange={e => setForm({ ...form, empleado_id: e.target.value })}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', background:'#F4FAF7' }}>
                    <option value="">Todos los empleados</option>
                    {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                </div>
              )}

              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Desde</div>
                <input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none', background:'#F4FAF7' }}/>
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Hasta</div>
                <input type="date" value={form.fecha_fin} min={form.fecha_inicio}
                  onChange={e => setForm({ ...form, fecha_fin: e.target.value })}
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Mono, monospace', outline:'none', background:'#F4FAF7' }}/>
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Motivo (visible al cliente)</div>
                <input value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })}
                  placeholder="Ej: Vacaciones de Semana Santa"
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', background:'#F4FAF7' }}/>
              </div>

              <button onClick={guardarCierre} disabled={saving || !form.fecha_inicio || !form.fecha_fin}
                style={{ width:'100%', background: (!form.fecha_inicio || !form.fecha_fin) ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', padding:'10px', borderRadius:8, fontSize:13, fontWeight:600, cursor: (!form.fecha_inicio || !form.fecha_fin) ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Guardando...' : 'Guardar cierre'}
              </button>
            </div>
          </div>

          <div style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:12, padding:16, fontSize:12.5, color:'#063D2A', lineHeight:1.6 }}>
            <strong>¿Cómo funciona?</strong><br/>
            Los días marcados como cerrados no aparecerán disponibles en tu página pública de reservas. Los clientes no podrán reservar en esas fechas.
          </div>
        </div>

      </div>
    </div>
  );
}