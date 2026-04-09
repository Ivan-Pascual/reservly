export const pushNotifications = {

  solicitarPermiso: async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const permiso = await Notification.requestPermission();
    return permiso === 'granted';
  },

  enviar: ({ titulo, cuerpo, icono = '/favicon.svg', url = '/reservas' }) => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    const notif = new Notification(titulo, {
      body:  cuerpo,
      icon:  icono,
      badge: icono,
      tag:   'reservly-nueva-reserva',
    });
    notif.onclick = () => {
      window.focus();
      window.location.href = url;
      notif.close();
    };
    setTimeout(() => notif.close(), 8000);
  },

  nuevaReserva: ({ clienteNombre, servicio, fecha, hora }) => {
    pushNotifications.enviar({
      titulo: `Nueva reserva — ${clienteNombre}`,
      cuerpo: `${servicio} · ${fecha} a las ${hora}`,
      url:    '/reservas',
    });
  },

  reservaCancelada: ({ clienteNombre, fecha, hora }) => {
    pushNotifications.enviar({
      titulo: `Reserva cancelada`,
      cuerpo: `${clienteNombre} · ${fecha} a las ${hora}`,
      url:    '/reservas',
    });
  },
};