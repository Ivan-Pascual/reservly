const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reservly-yqwz.vercel.app';

export const CONFIG = {
  BASE_URL,
  NOMBRE:      'Reservly',
  EMAIL:       'hola@getreservly.com',
  EMAIL_PRIV:  'privacidad@getreservly.com',
  DOMINIO:     'getreservly.com',
  URL_PUBLICA: (slug) => `${BASE_URL}/reservar/${slug}`,
  URL_WIDGET:  `${BASE_URL}/widget.js`,
  URL_DEMO:    `${BASE_URL}/demo`,
};

//const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reservly-yqwz.vercel.app';


//Luego en Vercel añades la variable:
//REACT_APP_BASE_URL = https://getreservly.com
//Y mañana solo cambias esa variable — toda la app se actualiza sola.
//REACT_APP_BASE_URL = https://getreservly.com