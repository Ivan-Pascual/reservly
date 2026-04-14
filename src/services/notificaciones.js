import { supabase } from '../supabase';

export const notificaciones = {

  confirmarReserva: async ({ cliente, negocio, reserva, servicio, empleado }) => {
    if (!cliente.email) return false;
    try {
      await supabase.functions.invoke('enviar-email', {
        body: { tipo: 'confirmacion', cliente, negocio, reserva, servicio, empleado },
      });
      return true;
    } catch (err) {
      console.error('Error enviando email:', err);
      return false;
    }
  },

  recordatorioCita: async ({ cliente, negocio, reserva, servicio }) => {
    if (!cliente.email) return false;
    try {
      await supabase.functions.invoke('enviar-email', {
        body: { tipo: 'recordatorio', cliente, negocio, reserva, servicio },
      });
      return true;
    } catch (err) {
      console.error('Error enviando recordatorio:', err);
      return false;
    }
  },
};