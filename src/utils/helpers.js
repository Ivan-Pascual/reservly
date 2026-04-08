export const slugificar = (texto) =>
  texto.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const validarEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validarTelefono = (tel) =>
  tel.replace(/\s/g, '').length >= 9;

export const calcularComision = (facturado, tipo, valor, citas) => {
  if (tipo === 'porcentaje') return Math.round(facturado * valor / 100 * 100) / 100;
  if (tipo === 'fijo') return valor * citas;
  return 0;
};

export const horaAMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};