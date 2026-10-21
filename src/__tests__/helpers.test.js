import {
  slugificar,
  validarEmail,
  validarTelefono,
  calcularComision,
  horaAMinutos,
} from '../utils/helpers';

describe('slugificar', () => {
  test('quita acentos y signos', () => {
    expect(slugificar('Peluquería Ana Ñandú!')).toBe('peluqueria-ana-nandu');
  });

  test('colapsa espacios y guiones repetidos', () => {
    expect(slugificar('  Hola   mundo  ')).toBe('hola-mundo');
    expect(slugificar('a--b')).toBe('a-b');
  });
});

describe('validarEmail', () => {
  test('acepta emails con formato válido', () => {
    expect(validarEmail('test@gmail.com')).toBe(true);
    expect(validarEmail('usuario@dominio.es')).toBe(true);
  });

  test('rechaza emails incompletos o con espacios', () => {
    expect(validarEmail('noesvalido')).toBe(false);
    expect(validarEmail('sin@dominio')).toBe(false);
    expect(validarEmail('con espacio@x.es')).toBe(false);
    expect(validarEmail('')).toBe(false);
  });
});

describe('validarTelefono', () => {
  test('exige al menos 9 dígitos, ignorando espacios', () => {
    expect(validarTelefono('600 123 456')).toBe(true);
    expect(validarTelefono('600123456')).toBe(true);
    expect(validarTelefono('60012345')).toBe(false);
    expect(validarTelefono('')).toBe(false);
  });
});

describe('calcularComision', () => {
  test('porcentaje sobre lo facturado', () => {
    expect(calcularComision(1000, 'porcentaje', 15, 0)).toBe(150);
    expect(calcularComision(999, 'porcentaje', 10, 0)).toBeCloseTo(99.9);
    expect(calcularComision(0, 'porcentaje', 15, 0)).toBe(0);
  });

  test('cantidad fija por cita', () => {
    expect(calcularComision(0, 'fijo', 10, 4)).toBe(40);
  });

  test('sin comisión devuelve 0', () => {
    expect(calcularComision(999, 'ninguna', 5, 3)).toBe(0);
  });
});

describe('horaAMinutos', () => {
  test('convierte hora HH:MM a minutos desde medianoche', () => {
    expect(horaAMinutos('00:00')).toBe(0);
    expect(horaAMinutos('09:30')).toBe(570);
    expect(horaAMinutos('18:05')).toBe(1085);
  });
});