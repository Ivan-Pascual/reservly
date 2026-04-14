import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Check de conexión — avisa si Supabase no responde
window.addEventListener('online',  () => console.log('Conexión restaurada'));
window.addEventListener('offline', () => {
  const banner = document.createElement('div');
  banner.id = 'offline-banner';
  banner.style.cssText = `
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999;
    background: #063D2A; color: #fff; text-align: center;
    padding: 10px; font-size: 13px; font-family: DM Sans, sans-serif;
    font-weight: 600;
  `;
  banner.textContent = '⚠️ Sin conexión — Los cambios no se guardarán hasta recuperar la conexión';
  document.body.appendChild(banner);
});

window.addEventListener('online', () => {
  const banner = document.getElementById('offline-banner');
  if (banner) banner.remove();
});

reportWebVitals();