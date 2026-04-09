import { supabase } from '../supabase';

export const generarBackup = async (negocioId, negocioNombre) => {
  try {
    const [
      clientesRes, reservasRes, serviciosRes, empleadosRes,
      stockRes, bonosRes, descuentosRes, cierresRes,
      valoracionesRes, tpvRes,
    ] = await Promise.all([
      supabase.from('clientes').select('*').eq('negocio_id', negocioId),
      supabase.from('reservas').select('*').eq('negocio_id', negocioId),
      supabase.from('servicios').select('*').eq('negocio_id', negocioId),
      supabase.from('empleados').select('*').eq('negocio_id', negocioId),
      supabase.from('productos').select('*').eq('negocio_id', negocioId),
      supabase.from('bonos').select('*').eq('negocio_id', negocioId),
      supabase.from('descuentos').select('*').eq('negocio_id', negocioId),
      supabase.from('cierres').select('*').eq('negocio_id', negocioId),
      supabase.from('valoraciones').select('*').eq('negocio_id', negocioId),
      supabase.from('tpv').select('*').eq('negocio_id', negocioId),
    ]);

    const backup = {
      meta: {
        negocio:        negocioNombre,
        negocio_id:     negocioId,
        fecha_backup:   new Date().toISOString(),
        version:        '1.0',
        generado_por:   'Reservly',
      },
      datos: {
        clientes:    clientesRes.data    || [],
        reservas:    reservasRes.data    || [],
        servicios:   serviciosRes.data   || [],
        empleados:   empleadosRes.data   || [],
        stock:       stockRes.data       || [],
        bonos:       bonosRes.data       || [],
        descuentos:  descuentosRes.data  || [],
        cierres:     cierresRes.data     || [],
        valoraciones: valoracionesRes.data || [],
        tpv:         tpvRes.data         || [],
      },
      resumen: {
        total_clientes:    clientesRes.data?.length    || 0,
        total_reservas:    reservasRes.data?.length    || 0,
        total_servicios:   serviciosRes.data?.length   || 0,
        total_empleados:   empleadosRes.data?.length   || 0,
        total_productos:   stockRes.data?.length       || 0,
      },
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const fecha = new Date().toISOString().split('T')[0];
    a.href     = url;
    a.download = `reservly_backup_${negocioNombre.replace(/\s+/g,'_')}_${fecha}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { ok: true, resumen: backup.resumen };
  } catch (err) {
    console.error('Error al generar backup:', err);
    return { ok: false, error: err.message };
  }
};