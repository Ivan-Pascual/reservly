import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useNegocio } from '../../hooks/useNegocio';
import { useIsMobile } from '../../hooks/useIsMobile';
import { exportarExcel, exportarPDF } from '../../services/exportar';
import { usePlan } from '../../hooks/usePlan';

const ESTADO_STYLES = {
  confirmada: { bg:'#E8F7F2', color:'#063D2A', label:'Confirmada' },
  pendiente:  { bg:'#FFF8E7', color:'#92400E', label:'Pendiente'  },
  completada: { bg:'#F1F5F9', color:'#6B9080', label:'Completada' },
  cancelada:  { bg:'#FEF2F2', color:'#EF4444', label:'Cancelada'  },
};

const POR_PAGINA = 20;

const formVacio = {
  cliente_id:'', empleado_id:'', servicio_id:'',
  fecha: new Date().toISOString().split('T')[0],
  hora_inicio:'09:00', hora_fin:'10:00',
  estado:'confirmada', notas:'',
};

export default function Reservas() {
  const { negocio } = useNegocio();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { puede } = usePlan();
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clienteNuevo, setClienteNuevo] = useState({ nombre:'', telefono:'', email:'' });
  const [modoCliente, setModoCliente] = useState('existente');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [formError, setFormError] = useState(''); // BUG 3

  useEffect(() => {
    if (!negocio) return;
    fetchTodo();
  }, [negocio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTodo = async () => {
    const [resRes, cliRes, empRes, serRes] = await Promise.all([
      supabase.from('reservas').select(`
        *, clientes(nombre, telefono), empleados(nombre, color), servicios(nombre, duracion, precio)
      `).eq('negocio_id', negocio.id).order('fecha', { ascending:false }).order('hora_inicio'),
      supabase.from('clientes').select('id, nombre, telefono').eq('negocio_id', negocio.id),
      supabase.from('empleados').select('id, nombre, color').eq('negocio_id', negocio.id).eq('activo', true),
      supabase.from('servicios').select('id, nombre, duracion, precio').eq('negocio_id', negocio.id).eq('activo', true),
    ]);
    if (resRes.data) setReservas(resRes.data);
    if (cliRes.data) setClientes(cliRes.data);
    if (empRes.data) setEmpleados(empRes.data);
    if (serRes.data) setServicios(serRes.data);
    setLoading(false);
  };

  const abrirEdicion = (r) => {
    setEditando(r.id);
    setFormError('');
    setForm({
      cliente_id:  r.cliente_id  || '',
      empleado_id: r.empleado_id || '',
      servicio_id: r.servicio_id || '',
      fecha:       r.fecha,
      hora_inicio: r.hora_inicio?.slice(0,5) || '09:00',
      hora_fin:    r.hora_fin?.slice(0,5)    || '10:00',
      estado:      r.estado,
      notas:       r.notas || '',
    });
    setShowForm(true);
  };

  const cerrarForm = () => {
    setShowForm(false);
    setEditando(null);
    setForm(formVacio);
    setFormError('');
    setModoCliente('existente');
    setClienteNuevo({ nombre:'', telefono:'', email:'' });
  };

  const guardarReserva = async () => {
    setFormError('');

    // BUG 3 FIX — validaciones completas con mensaje visible
    if (modoCliente === 'existente' && !form.cliente_id) {
      setFormError('Selecciona un cliente o crea uno nuevo.');
      return;
    }
    if (modoCliente === 'nuevo' && !clienteNuevo.nombre.trim()) {
      setFormError('El nombre del cliente es obligatorio.');
      return;
    }
    if (!form.fecha) {
      setFormError('La fecha es obligatoria.');
      return;
    }
    if (!form.hora_inicio || !form.hora_fin) {
      setFormError('La hora de inicio y fin son obligatorias.');
      return;
    }
    if (form.hora_inicio >= form.hora_fin) {
      setFormError('La hora de fin debe ser posterior a la de inicio.');
      return;
    }

    setSaving(true);
    let clienteId = form.cliente_id;

    if (modoCliente === 'nuevo') {
      const { data: nuevoCliente, error } = await supabase
        .from('clientes').insert({
          negocio_id: negocio.id,
          nombre:     clienteNuevo.nombre.trim(),
          telefono:   clienteNuevo.telefono.trim() || null,
          email:      clienteNuevo.email.trim()    || null,
          tag:        'nuevo',
        }).select().single();
      if (error || !nuevoCliente) {
        setFormError('Error al crear el cliente. Inténtalo de nuevo.');
        setSaving(false);
        return;
      }
      clienteId = nuevoCliente.id;
      setClientes(prev => [...prev, nuevoCliente]);
    }

    const payload = {
      cliente_id:  clienteId        || null,
      empleado_id: form.empleado_id || null,
      servicio_id: form.servicio_id || null,
      fecha:       form.fecha,
      hora_inicio: form.hora_inicio,
      hora_fin:    form.hora_fin,
      estado:      form.estado,
      notas:       form.notas || null,
    };

    if (editando) {
      const reservaActual = reservas.find(r => r.id === editando);
      if (reservaActual?.estado === 'completada') {
        setFormError('No se puede editar una reserva ya completada.');
        setSaving(false);
        return;
      }

      await supabase.from('reservas').update(payload).eq('id', editando);

      if (form.estado === 'completada' && reservaActual?.estado !== 'completada') {
        const servicio = servicios.find(s => s.id === form.servicio_id);
        const precio = servicio?.precio || 0;
        const { data: tpvExistente } = await supabase.from('tpv').select('id').eq('reserva_id', editando).single();
        if (!tpvExistente) {
          const { data: tpv } = await supabase.from('tpv').insert({
            reserva_id: editando, negocio_id: negocio.id,
            metodo_pago: 'efectivo', importe: precio, propina: 0,
          }).select().single();
          if (tpv && servicio) {
            await supabase.from('reservas').update({ precio_final: precio }).eq('id', editando);
            await supabase.from('tpv_productos').insert({ tpv_id: tpv.id, nombre: servicio.nombre, precio });
          }
        }
      }
    } else {
      const { data: nuevaReserva } = await supabase
        .from('reservas').insert({ ...payload, negocio_id: negocio.id }).select().single();

      if (form.estado === 'completada' && nuevaReserva) {
        const servicio = servicios.find(s => s.id === form.servicio_id);
        const precio = servicio?.precio || 0;
        const { data: tpv } = await supabase.from('tpv').insert({
          reserva_id: nuevaReserva.id, negocio_id: negocio.id,
          metodo_pago: 'efectivo', importe: precio, propina: 0,
        }).select().single();
        if (tpv && servicio) {
          await supabase.from('reservas').update({ precio_final: precio }).eq('id', nuevaReserva.id);
          await supabase.from('tpv_productos').insert({ tpv_id: tpv.id, nombre: servicio.nombre, precio });
        }
      }
    }

    cerrarForm();
    fetchTodo();
    setSaving(false);
  };

  // BUG 2 FIX — reactivar en vez de solo cancelar
  const cambiarEstado = async (id, nuevoEstado) => {
    await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id);
    fetchTodo();
  };

  const eliminarReserva = async (id) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    await cambiarEstado(id, 'cancelada');
  };

  const reactivarReserva = async (id) => {
    await cambiarEstado(id, 'pendiente');
  };

  const copiarLinkResena = (r) => {
    const url = `https://getreservly.com/resena/${negocio?.slug}/${r.id}`;
    navigator.clipboard.writeText(url);
    alert('Link de reseña copiado.');
  };

  // BUG 1 FIX — usar telefono del cliente correctamente
  const linkWA = (r) => {
    const telefono = r.clientes?.telefono;
    if (!telefono) return null;
    const tel = telefono.replace(/\s/g,'').replace('+','');
    if (!tel || !/^\d+$/.test(tel)) return null;
    const link = `https://getreservly.com/resena/${negocio?.slug}/${r.id}`;
    const msg = encodeURIComponent(`Hola ${r.clientes?.nombre || ''}! Gracias por tu visita 😊 ¿Nos dejas una reseña? ${link}`);
    return `https://wa.me/${tel}?text=${msg}`;
  };

  const filtradas = reservas.filter(r => {
    const matchF = filtro === 'todas' || r.estado === filtro;
    const matchB = (r.clientes?.nombre || '').toLowerCase().includes(busqueda.toLowerCase());
    const matchD = !fechaFiltro || r.fecha === fechaFiltro;
    return matchF && matchB && matchD;
  });

  const totalPaginas = Math.ceil(filtradas.length / POR_PAGINA);
  const paginadas = filtradas.slice((pagina-1)*POR_PAGINA, pagina*POR_PAGINA);
  const pad = isMobile ? 16 : 32;

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'#6B9080' }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EAF5EF', padding:`0 ${pad}px`, height:60, display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16' }}>Reservas</div>
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          {!isMobile && (
            <>
              <button onClick={() => {
                if (!puede('exportar')) { navigate('/ajustes'); return; }
                exportarExcel.reservas(reservas, negocio?.nombre);
              }} style={{ padding:'7px 10px', background:'#F4FAF7', border:'1px solid #D6EDE5', borderRadius:8, fontSize:12, fontWeight:600, color: puede('exportar') ? '#6B9080' : '#A8C4B8', cursor:'pointer', position:'relative' }}>
                {!puede('exportar') && <span style={{ position:'absolute', top:-5, right:-5, fontSize:10 }}>🔒</span>}
                📊 Excel
              </button>
              <button onClick={() => {
                if (!puede('exportar')) { navigate('/ajustes'); return; }
                exportarPDF.reservas(reservas, negocio?.nombre);
              }} style={{ padding:'7px 10px', background:'#F4FAF7', border:'1px solid #D6EDE5', borderRadius:8, fontSize:12, fontWeight:600, color: puede('exportar') ? '#6B9080' : '#A8C4B8', cursor:'pointer', position:'relative' }}>
                {!puede('exportar') && <span style={{ position:'absolute', top:-5, right:-5, fontSize:10 }}>🔒</span>}
                📄 PDF
              </button>
            </>
          )}
          <button onClick={() => { cerrarForm(); setShowForm(true); }}
            style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + Nueva
          </button>
        </div>
      </div>

      <div style={{ padding:pad, display:'flex', flexDirection:'column', gap:16 }}>

        {/* Form */}
        {showForm && (
          <div style={{ background:'#fff', border:'1.5px solid #0A9E6E', borderRadius:14, padding: isMobile ? 16 : 24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16', marginBottom:16 }}>
              {editando ? 'Editar reserva' : 'Nueva reserva'}
            </div>
            {editando && reservas.find(r=>r.id===editando)?.estado === 'completada' && (
              <div style={{ background:'#FFF8E7', border:'1px solid #F5E4A0', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#92400E', marginBottom:14 }}>
                ⚠️ Esta reserva ya está completada y no puede editarse.
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Cliente *</div>
                <div style={{ display:'flex', background:'#F4FAF7', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden', marginBottom:8 }}>
                  <button onClick={() => setModoCliente('existente')} style={{
                    flex:1, padding:'7px', fontSize:12.5, fontWeight:600,
                    background: modoCliente==='existente' ? '#0A9E6E' : 'transparent',
                    color: modoCliente==='existente' ? '#fff' : '#6B9080',
                    border:'none', cursor:'pointer',
                  }}>Cliente existente</button>
                  <button onClick={() => setModoCliente('nuevo')} style={{
                    flex:1, padding:'7px', fontSize:12.5, fontWeight:600,
                    background: modoCliente==='nuevo' ? '#0A9E6E' : 'transparent',
                    color: modoCliente==='nuevo' ? '#fff' : '#6B9080',
                    border:'none', cursor:'pointer',
                  }}>+ Cliente nuevo</button>
                </div>
                {modoCliente === 'existente' ? (
                  <select value={form.cliente_id} onChange={e=>setForm({...form, cliente_id:e.target.value})}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13 }}>
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <input value={clienteNuevo.nombre} onChange={e=>setClienteNuevo({...clienteNuevo, nombre:e.target.value})}
                      placeholder="Nombre *"
                      style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
                    <input value={clienteNuevo.telefono} onChange={e=>setClienteNuevo({...clienteNuevo, telefono:e.target.value})}
                      placeholder="Teléfono"
                      style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', fontFamily:'DM Mono, monospace' }}/>
                    <input value={clienteNuevo.email} onChange={e=>setClienteNuevo({...clienteNuevo, email:e.target.value})}
                      placeholder="Email (opcional)" type="email"
                      style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
                  </div>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:10 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Empleado</div>
                  <select value={form.empleado_id} onChange={e=>setForm({...form, empleado_id:e.target.value})}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13 }}>
                    <option value="">Sin asignar</option>
                    {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Servicio</div>
                  <select value={form.servicio_id} onChange={e=>setForm({...form, servicio_id:e.target.value})}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13 }}>
                    <option value="">Sin asignar</option>
                    {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} — {s.precio ? s.precio+' EUR' : 'A consultar'}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap:10 }}>
                <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Fecha *</div>
                  <input type="date" value={form.fecha} onChange={e=>setForm({...form, fecha:e.target.value})}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Hora inicio</div>
                  <input type="time" value={form.hora_inicio} onChange={e=>setForm({...form, hora_inicio:e.target.value})}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Hora fin</div>
                  <input type="time" value={form.hora_fin} onChange={e=>setForm({...form, hora_fin:e.target.value})}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Estado</div>
                  <select value={form.estado} onChange={e=>setForm({...form, estado:e.target.value})}
                    style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13 }}>
                    <option value="confirmada">Confirmada</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', marginBottom:5 }}>Notas internas</div>
                <input value={form.notas} onChange={e=>setForm({...form, notas:e.target.value})}
                  placeholder="Notas internas sobre la reserva..."
                  style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none' }}/>
              </div>

              {form.estado === 'completada' && (
                <div style={{ background:'#E8F7F2', border:'1px solid #D6EDE5', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#063D2A' }}>
                  ✓ Al guardar se registrará automáticamente el cobro y se calcularán las comisiones.
                </div>
              )}

              {/* BUG 3 FIX — error visible en el form */}
              {formError && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#EF4444' }}>
                  {formError}
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={guardarReserva} disabled={saving}
                style={{ background: saving ? '#A8C4B8' : '#0A9E6E', color:'#fff', border:'none', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar reserva'}
              </button>
              <button onClick={cerrarForm}
                style={{ background:'transparent', color:'#6B9080', border:'1px solid #D6EDE5', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap:10, alignItems: isMobile ? 'stretch' : 'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, padding:'7px 14px', flex: isMobile ? 'auto' : 1 }}>
            <span style={{ color:'#A8C4B8' }}>🔍</span>
            <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              placeholder="Buscar cliente..."
              style={{ border:'none', outline:'none', fontSize:13, color:'#0B1E16', background:'transparent', width:'100%' }}/>
          </div>
          <input type="date" value={fechaFiltro} onChange={e => { setFechaFiltro(e.target.value); setPagina(1); }}
            style={{ padding:'7px 12px', border:'1px solid #D6EDE5', borderRadius:8, fontSize:13, outline:'none', background:'#fff' }}/>
          {fechaFiltro && (
            <button onClick={() => { setFechaFiltro(''); setPagina(1); }}
              style={{ padding:'7px 12px', background:'#FEF2F2', border:'none', borderRadius:8, fontSize:12, color:'#EF4444', fontWeight:600, cursor:'pointer' }}>
              ✕ Limpiar
            </button>
          )}
          <div style={{ display:'flex', background:'#fff', border:'1px solid #D6EDE5', borderRadius:8, overflow:'hidden', flexWrap:'wrap' }}>
            {['todas','confirmada','pendiente','completada','cancelada'].map(f => (
              <button key={f} onClick={() => { setFiltro(f); setPagina(1); }} style={{
                padding:'7px 10px', fontSize:11.5, fontWeight:500,
                color: filtro===f ? '#fff' : '#6B9080',
                background: filtro===f ? '#0A9E6E' : 'transparent',
                border:'none', borderRight:'1px solid #D6EDE5', cursor:'pointer',
                textTransform:'capitalize',
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {reservas.length > 0 ? (
          <>
            {isMobile ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {paginadas.map(r => {
                  const s = ESTADO_STYLES[r.estado] || ESTADO_STYLES.confirmada;
                  const esCompletada = r.estado === 'completada';
                  const esCancelada = r.estado === 'cancelada';
                  const waUrl = linkWA(r);
                  return (
                    <div key={r.id} style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:12, padding:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:'#0B1E16' }}>{r.clientes?.nombre || '—'}</div>
                        <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:s.bg, color:s.color }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize:12.5, color:'#6B9080', marginBottom:4 }}>{r.servicios?.nombre || '—'}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                        {r.empleados && <div style={{ width:7, height:7, borderRadius:'50%', background:r.empleados.color||'#ccc' }}/>}
                        <span style={{ fontSize:12, color:'#6B9080' }}>{r.empleados?.nombre || '—'}</span>
                        <span style={{ fontSize:12, color:'#A8C4B8', marginLeft:'auto', fontFamily:'DM Mono, monospace' }}>{r.fecha} · {r.hora_inicio?.slice(0,5)}</span>
                      </div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {!esCompletada && !esCancelada && (
                          <button onClick={() => abrirEdicion(r)}
                            style={{ flex:1, padding:'7px', fontSize:12, fontWeight:600, background:'#E8F7F2', color:'#0A9E6E', border:'none', borderRadius:8, cursor:'pointer' }}>
                            Editar
                          </button>
                        )}
                        {r.estado === 'confirmada' && (
                          <button onClick={() => navigate(`/tpv/${r.id}`)}
                            style={{ flex:1, padding:'7px', fontSize:12, fontWeight:600, background:'#063D2A', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}>
                            Cobrar
                          </button>
                        )}
                        {esCompletada && (
                          <>
                            {waUrl && (
                              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                                style={{ flex:1, padding:'7px', fontSize:12, fontWeight:600, background:'#25D366', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', textDecoration:'none', textAlign:'center' }}>
                                💬 Reseña
                              </a>
                            )}
                            <button onClick={() => copiarLinkResena(r)}
                              style={{ flex:1, padding:'7px', fontSize:12, fontWeight:600, background:'#FFF8E7', color:'#92400E', border:'none', borderRadius:8, cursor:'pointer' }}>
                              ⭐ Link
                            </button>
                          </>
                        )}
                        {/* BUG 2 FIX — canceladas pueden reactivarse */}
                        {esCancelada && (
                          <button onClick={() => reactivarReserva(r.id)}
                            style={{ flex:1, padding:'7px', fontSize:12, fontWeight:600, background:'#E8F7F2', color:'#0A9E6E', border:'none', borderRadius:8, cursor:'pointer' }}>
                            Reactivar
                          </button>
                        )}
                        {!esCancelada && !esCompletada && (
                          <button onClick={() => eliminarReserva(r.id)}
                            style={{ padding:'7px 12px', fontSize:12, fontWeight:600, background:'#FEF2F2', color:'#EF4444', border:'none', borderRadius:8, cursor:'pointer' }}>
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {paginadas.length === 0 && (
                  <div style={{ padding:40, textAlign:'center', color:'#A8C4B8', fontSize:14 }}>No hay reservas que coincidan</div>
                )}
              </div>
            ) : (
              <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1fr 1fr 1fr 180px', padding:'10px 20px', background:'#F4FAF7', borderBottom:'1px solid #EAF5EF', gap:12 }}>
                  {['Cliente','Servicio','Empleado','Fecha','Hora','Estado',''].map(h=>(
                    <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B9080', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
                  ))}
                </div>
                {paginadas.map((r, i) => {
                  const s = ESTADO_STYLES[r.estado] || ESTADO_STYLES.confirmada;
                  const esCompletada = r.estado === 'completada';
                  const esCancelada = r.estado === 'cancelada';
                  const waUrl = linkWA(r);
                  return (
                    <div key={r.id} style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1fr 1fr 1fr 180px', padding:'14px 20px', borderBottom: i<paginadas.length-1?'1px solid #EAF5EF':'none', gap:12, alignItems:'center' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#F4FAF7'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <div style={{ fontSize:13.5, fontWeight:600, color:'#0B1E16' }}>{r.clientes?.nombre || '—'}</div>
                      <div style={{ fontSize:13, color:'#6B9080' }}>{r.servicios?.nombre || '—'}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:r.empleados?.color||'#ccc', flexShrink:0 }}/>
                        <span style={{ fontSize:13, color:'#0B1E16' }}>{r.empleados?.nombre || '—'}</span>
                      </div>
                      <div style={{ fontSize:12.5, color:'#6B9080' }}>{r.fecha}</div>
                      <div style={{ fontSize:12.5, fontFamily:'DM Mono, monospace', color:'#0B1E16' }}>{r.hora_inicio?.slice(0,5)}</div>
                      <div><span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:s.bg, color:s.color }}>{s.label}</span></div>
                      <div style={{ display:'flex', gap:4 }}>
                        {!esCompletada && !esCancelada && (
                          <button onClick={() => abrirEdicion(r)}
                            style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'#E8F7F2', color:'#0A9E6E', border:'none', borderRadius:6, cursor:'pointer' }}>
                            Editar
                          </button>
                        )}
                        {r.estado === 'confirmada' && (
                          <button onClick={() => navigate(`/tpv/${r.id}`)}
                            style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'#063D2A', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>
                            Cobrar
                          </button>
                        )}
                        {esCompletada && (
                          <>
                            {waUrl && (
                              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                                style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'#25D366', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', textDecoration:'none', display:'inline-flex', alignItems:'center' }}>
                                💬 WA
                              </a>
                            )}
                            <button onClick={() => copiarLinkResena(r)}
                              style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'#FFF8E7', color:'#92400E', border:'none', borderRadius:6, cursor:'pointer' }}>
                              ⭐
                            </button>
                          </>
                        )}
                        {/* BUG 2 FIX — canceladas pueden reactivarse */}
                        {esCancelada && (
                          <button onClick={() => reactivarReserva(r.id)}
                            style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'#E8F7F2', color:'#0A9E6E', border:'none', borderRadius:6, cursor:'pointer' }}>
                            Reactivar
                          </button>
                        )}
                        {!esCancelada && !esCompletada && (
                          <button onClick={() => eliminarReserva(r.id)}
                            style={{ padding:'4px 8px', fontSize:11, fontWeight:600, background:'#FEF2F2', color:'#EF4444', border:'none', borderRadius:6, cursor:'pointer' }}>
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {paginadas.length === 0 && (
                  <div style={{ padding:40, textAlign:'center', color:'#A8C4B8', fontSize:14 }}>No hay reservas que coincidan</div>
                )}
              </div>
            )}

            {/* Paginación */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
              <div style={{ fontSize:12, color:'#A8C4B8' }}>
                {filtradas.length} reservas · mostrando {filtradas.length > 0 ? (pagina-1)*POR_PAGINA+1 : 0}–{Math.min(pagina*POR_PAGINA, filtradas.length)}
              </div>
              {totalPaginas > 1 && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <button onClick={() => setPagina(p=>Math.max(1,p-1))} disabled={pagina===1}
                    style={{ padding:'6px 12px', border:'1px solid #D6EDE5', borderRadius:8, background:pagina===1?'#F4FAF7':'#fff', color:pagina===1?'#A8C4B8':'#6B9080', fontSize:12, fontWeight:600, cursor:pagina===1?'not-allowed':'pointer' }}>
                    ← Anterior
                  </button>
                  {Array.from({ length: totalPaginas }, (_,i) => i+1).map(p => (
                    <button key={p} onClick={() => setPagina(p)}
                      style={{ padding:'6px 10px', border:'1px solid #D6EDE5', borderRadius:8, background:pagina===p?'#0A9E6E':'#fff', color:pagina===p?'#fff':'#6B9080', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPagina(p=>Math.min(totalPaginas,p+1))} disabled={pagina===totalPaginas}
                    style={{ padding:'6px 12px', border:'1px solid #D6EDE5', borderRadius:8, background:pagina===totalPaginas?'#F4FAF7':'#fff', color:pagina===totalPaginas?'#A8C4B8':'#6B9080', fontSize:12, fontWeight:600, cursor:pagina===totalPaginas?'not-allowed':'pointer' }}>
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ background:'#fff', border:'1px solid #EAF5EF', borderRadius:14, padding:'60px 40px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#0B1E16', marginBottom:6 }}>Sin reservas aún</div>
            <div style={{ fontSize:13, color:'#6B9080', marginBottom:20 }}>Las reservas aparecerán aquí cuando los clientes reserven</div>
            <button onClick={() => setShowForm(true)}
              style={{ background:'#0A9E6E', color:'#fff', border:'none', padding:'10px 24px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + Nueva reserva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}