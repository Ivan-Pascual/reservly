import { slugificar } from '../utils/helpers';

// Test slugificar
test('slugificar convierte texto a slug válido', () => {
  expect(slugificar('Peluquería Mía')).toBe('peluqueria-mia');
  expect(slugificar('Bar & Restaurante')).toBe('bar-restaurante');
  expect(slugificar('  Espacios   Extra  ')).toBe('espacios-extra');
  expect(slugificar('MAYÚSCULAS')).toBe('mayusculas');
  expect(slugificar('José García')).toBe('jose-garcia');
});

// Test validación teléfono
test('validación de teléfono mínimo 9 dígitos', () => {
  const validarTel = (tel) => tel.replace(/\s/g, '').length >= 9;
  expect(validarTel('+34 612 345 678')).toBe(true);
  expect(validarTel('612345678')).toBe(true);
  expect(validarTel('123')).toBe(false);
  expect(validarTel('')).toBe(false);
});

// Test validación email
test('validación de formato email', () => {
  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  expect(validarEmail('test@gmail.com')).toBe(true);
  expect(validarEmail('usuario@dominio.es')).toBe(true);
  expect(validarEmail('noesvalido')).toBe(false);
  expect(validarEmail('sin@dominio')).toBe(false);
  expect(validarEmail('')).toBe(false);
});

// Test cálculo comisiones
test('cálculo de comisiones por porcentaje', () => {
  const calcComision = (facturado, tipo, valor, citas) => {
    if (tipo === 'porcentaje') return Math.round(facturado * valor / 100 * 100) / 100;
    if (tipo === 'fijo') return valor * citas;
    return 0;
  };
  expect(calcComision(1000, 'porcentaje', 10, 0)).toBe(100);
  expect(calcComision(500,  'porcentaje', 8,  0)).toBe(40);
  expect(calcComision(0,    'fijo',       5, 10)).toBe(50);
  expect(calcComision(999,  'ninguna',    0,  0)).toBe(0);
});

// Test generación de huecos
test('generación de huecos respeta duración del servicio', () => {
  const generarHuecos = (inicioMin, finMin, duracion, reservas = []) => {
    const huecos = [];
    for (let min = inicioMin; min + duracion <= finMin; min += 30) {
      const horaStr    = `${String(Math.floor(min/60)).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`;
      const horaFinStr = `${String(Math.floor((min+duracion)/60)).padStart(2,'0')}:${String((min+duracion)%60).padStart(2,'0')}`;
      const ocupado = reservas.some(r => horaStr < r.fin && horaFinStr > r.ini);
      if (!ocupado) huecos.push(horaStr);
    }
    return huecos;
  };

  // 9:00 a 10:00 con servicio de 45 min → solo un hueco
  const huecos = generarHuecos(9*60, 10*60, 45);
  expect(huecos).toContain('09:00');
  expect(huecos.length).toBe(1);

  // 9:00 a 11:00 con servicio de 30 min → 4 huecos
  const huecos2 = generarHuecos(9*60, 11*60, 30);
  expect(huecos2.length).toBe(4);

  // Con reserva bloqueando 9:00-9:45 → no debe aparecer 9:00
  const huecos3 = generarHuecos(9*60, 11*60, 30, [{ ini:'09:00', fin:'09:45' }]);
  expect(huecos3).not.toContain('09:00');
});

// Test anti-spam
test('anti-spam bloquea más de 3 reservas en 24h', () => {
  const superaLimite = (numReservas) => numReservas >= 3;
  expect(superaLimite(0)).toBe(false);
  expect(superaLimite(2)).toBe(false);
  expect(superaLimite(3)).toBe(true);
  expect(superaLimite(10)).toBe(true);
});