// Servicio de notificaciones — Resend (email)
// Las notificaciones reales se envían desde el backend
// Por ahora registramos en Supabase y Resend las envía via webhook

export const notificaciones = {

  // Confirmar reserva al cliente
  confirmarReserva: async ({ cliente, negocio, reserva, servicio, empleado }) => {
    try {
      const { error } = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from:    `${negocio.nombre} <reservas@reservly.com>`,
          to:      [cliente.email],
          subject: `✅ Reserva confirmada en ${negocio.nombre}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
              <div style="background: #063D2A; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 20px;">Reservly</h1>
              </div>
              <div style="background: #F4FAF7; padding: 24px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #0B1E16; margin: 0 0 16px;">¡Tu reserva está confirmada!</h2>
                <p style="color: #6B9080; margin: 0 0 20px;">Hola ${cliente.nombre}, aquí tienes los detalles de tu cita:</p>
                <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #6B9080; font-size: 13px;">Negocio</td><td style="padding: 8px 0; font-weight: 600; font-size: 13px; text-align: right;">${negocio.nombre}</td></tr>
                    <tr style="border-top: 1px solid #EAF5EF;"><td style="padding: 8px 0; color: #6B9080; font-size: 13px;">Servicio</td><td style="padding: 8px 0; font-weight: 600; font-size: 13px; text-align: right;">${servicio?.nombre || '—'}</td></tr>
                    ${empleado ? `<tr style="border-top: 1px solid #EAF5EF;"><td style="padding: 8px 0; color: #6B9080; font-size: 13px;">Profesional</td><td style="padding: 8px 0; font-weight: 600; font-size: 13px; text-align: right;">${empleado.nombre}</td></tr>` : ''}
                    <tr style="border-top: 1px solid #EAF5EF;"><td style="padding: 8px 0; color: #6B9080; font-size: 13px;">Fecha</td><td style="padding: 8px 0; font-weight: 600; font-size: 13px; text-align: right;">${reserva.fecha}</td></tr>
                    <tr style="border-top: 1px solid #EAF5EF;"><td style="padding: 8px 0; color: #6B9080; font-size: 13px;">Hora</td><td style="padding: 8px 0; font-weight: 600; font-size: 13px; text-align: right;">${reserva.hora_inicio?.slice(0,5)}</td></tr>
                  </table>
                </div>
                ${negocio.direccion ? `<p style="color: #6B9080; font-size: 13px; margin: 0 0 8px;">📍 ${negocio.direccion}</p>` : ''}
                ${negocio.telefono ? `<p style="color: #6B9080; font-size: 13px; margin: 0 0 20px;">📞 ${negocio.telefono}</p>` : ''}
                <p style="color: #A8C4B8; font-size: 12px; margin: 0; text-align: center;">Reserva gestionada por Reservly</p>
              </div>
            </div>
          `,
        }),
      });
      return !error;
    } catch (err) {
      console.error('Error enviando email:', err);
      return false;
    }
  },

  // Recordatorio de cita
  recordatorioCita: async ({ cliente, negocio, reserva, servicio }) => {
    if (!cliente.email) return false;
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from:    `${negocio.nombre} <reservas@reservly.com>`,
          to:      [cliente.email],
          subject: `⏰ Recordatorio: tu cita en ${negocio.nombre} es mañana`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
              <div style="background: #063D2A; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 20px;">Reservly</h1>
              </div>
              <div style="background: #F4FAF7; padding: 24px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #0B1E16; margin: 0 0 16px;">¡No olvides tu cita!</h2>
                <p style="color: #6B9080; margin: 0 0 20px;">Hola ${cliente.nombre}, te recordamos que tienes una cita mañana:</p>
                <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #6B9080; font-size: 13px;">Servicio</td><td style="padding: 8px 0; font-weight: 600; font-size: 13px; text-align: right;">${servicio?.nombre || '—'}</td></tr>
                    <tr style="border-top: 1px solid #EAF5EF;"><td style="padding: 8px 0; color: #6B9080; font-size: 13px;">Fecha</td><td style="padding: 8px 0; font-weight: 600; font-size: 13px; text-align: right;">${reserva.fecha}</td></tr>
                    <tr style="border-top: 1px solid #EAF5EF;"><td style="padding: 8px 0; color: #6B9080; font-size: 13px;">Hora</td><td style="padding: 8px 0; font-weight: 600; font-size: 13px; text-align: right;">${reserva.hora_inicio?.slice(0,5)}</td></tr>
                  </table>
                </div>
                <p style="color: #A8C4B8; font-size: 12px; margin: 0; text-align: center;">Reserva gestionada por Reservly</p>
              </div>
            </div>
          `,
        }),
      });
      return true;
    } catch (err) {
      console.error('Error enviando recordatorio:', err);
      return false;
    }
  },
};