const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar';

export const googleCalendar = {

  // Cargar el script de Google
  cargarScript: () => {
    return new Promise((resolve, reject) => {
      if (window.gapi) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  },

  // Cargar GSI (Google Sign-In)
  cargarGSI: () => {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  },

  // Iniciar sesión con Google y obtener token
  conectar: () => {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts) {
        reject(new Error('Google no cargado'));
        return;
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          // Guardar token en localStorage
          localStorage.setItem('google_calendar_token', response.access_token);
          localStorage.setItem('google_calendar_expiry', Date.now() + (response.expires_in * 1000));
          resolve(response.access_token);
        },
      });
      client.requestAccessToken();
    });
  },

  // Obtener token guardado si sigue válido
  getToken: () => {
    const token  = localStorage.getItem('google_calendar_token');
    const expiry = localStorage.getItem('google_calendar_expiry');
    if (!token || !expiry) return null;
    if (Date.now() > parseInt(expiry)) {
      localStorage.removeItem('google_calendar_token');
      localStorage.removeItem('google_calendar_expiry');
      return null;
    }
    return token;
  },

  // Desconectar
  desconectar: () => {
    const token = localStorage.getItem('google_calendar_token');
    if (token && window.google?.accounts) {
      window.google.accounts.oauth2.revoke(token);
    }
    localStorage.removeItem('google_calendar_token');
    localStorage.removeItem('google_calendar_expiry');
  },

  // Crear evento en Google Calendar
  crearEvento: async (reserva) => {
    const token = googleCalendar.getToken();
    if (!token) throw new Error('No conectado a Google Calendar');

    const fechaInicio = `${reserva.fecha}T${reserva.hora_inicio}:00`;
    const fechaFin    = `${reserva.fecha}T${reserva.hora_fin}:00`;

    const evento = {
      summary:     `${reserva.cliente} — ${reserva.servicio}`,
      description: `Cliente: ${reserva.cliente}\nServicio: ${reserva.servicio}\nEmpleado: ${reserva.empleado || 'Sin asignar'}\nGestionado por Reservly`,
      start: { dateTime: fechaInicio, timeZone: 'Europe/Madrid' },
      end:   { dateTime: fechaFin,    timeZone: 'Europe/Madrid' },
      colorId: '2', // Verde
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify(evento),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Error al crear evento');
    }

    return await res.json();
  },

  // Eliminar evento de Google Calendar
  eliminarEvento: async (eventoId) => {
    const token = googleCalendar.getToken();
    if (!token) return;

    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventoId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
  },

  // Sincronizar todas las reservas pendientes y confirmadas
  sincronizarTodas: async (reservas) => {
    const token = googleCalendar.getToken();
    if (!token) throw new Error('No conectado a Google Calendar');

    const resultados = { ok: 0, error: 0 };
    for (const r of reservas) {
      try {
        await googleCalendar.crearEvento({
          cliente:  r.clientes?.nombre  || 'Cliente',
          servicio: r.servicios?.nombre || 'Servicio',
          empleado: r.empleados?.nombre || '',
          fecha:    r.fecha,
          hora_inicio: r.hora_inicio?.slice(0,5),
          hora_fin:    r.hora_fin?.slice(0,5),
        });
        resultados.ok++;
      } catch {
        resultados.error++;
      }
    }
    return resultados;
  },
};