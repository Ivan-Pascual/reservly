(function() {
  'use strict';

  // Estilos del widget
  const CSS = `
    .reservly-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #0A9E6E;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 12px 22px;
      font-size: 14px;
      font-weight: 600;
      font-family: system-ui, sans-serif;
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(10,158,110,0.3);
      transition: background 0.2s, transform 0.1s;
      text-decoration: none;
    }
    .reservly-btn:hover { background: #063D2A; transform: translateY(-1px); }
    .reservly-btn:active { transform: translateY(0); }
    .reservly-btn svg { width: 18px; height: 18px; }

    .reservly-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 999998;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: reservly-fade-in 0.2s ease;
    }
    @media (min-width: 600px) {
      .reservly-overlay { align-items: center; }
    }
    @keyframes reservly-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .reservly-modal {
      background: #fff;
      border-radius: 20px 20px 0 0;
      width: 100%;
      max-width: 480px;
      height: 92vh;
      max-height: 700px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: reservly-slide-up 0.3s ease;
      z-index: 999999;
    }
    @media (min-width: 600px) {
      .reservly-modal {
        border-radius: 20px;
        height: 85vh;
      }
    }
    @keyframes reservly-slide-up {
      from { transform: translateY(40px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .reservly-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid #EAF5EF;
      background: #fff;
      flex-shrink: 0;
    }
    .reservly-modal-logo {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 15px;
      font-weight: 700;
      color: #063D2A;
      font-family: system-ui, sans-serif;
    }
    .reservly-modal-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: #F4FAF7;
      color: #6B9080;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, sans-serif;
    }
    .reservly-modal-close:hover { background: #EAF5EF; }

    .reservly-iframe {
      flex: 1;
      border: none;
      width: 100%;
    }

    .reservly-footer {
      padding: 8px 16px;
      text-align: center;
      font-size: 11px;
      color: #A8C4B8;
      font-family: system-ui, sans-serif;
      border-top: 1px solid #EAF5EF;
      flex-shrink: 0;
    }
    .reservly-footer a {
      color: #0A9E6E;
      text-decoration: none;
      font-weight: 600;
    }
  `;

  // Inyectar estilos
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // SVG logo Reservly
  const LOGO_SVG = `<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 42L10 8C10 5 12 4 14 4L28 4C38 4 44 10 44 18C44 26 38 32 28 32L10 32M21 32L44 42"
      stroke="#0A9E6E" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="21" cy="32" r="4.5" fill="#0A9E6E"/>
    <circle cx="21" cy="32" r="2.2" fill="white"/>
  </svg>`;

  // Crear widget para cada elemento con data-reservly-slug
  function initWidget(el) {
    const slug = el.getAttribute('data-reservly-slug');
    if (!slug) return;

    const baseUrl = el.getAttribute('data-reservly-url') || 'https://reservly-yqwz.vercel.app';
    const textoBtn = el.getAttribute('data-reservly-text') || 'Reservar cita';
    const colorBtn = el.getAttribute('data-reservly-color') || '#0A9E6E';

    // Crear botón
    const btn = document.createElement('button');
    btn.className = 'reservly-btn';
    btn.style.background = colorBtn;
    btn.innerHTML = `${LOGO_SVG} ${textoBtn}`;
    el.appendChild(btn);

    // Crear overlay + modal
    let overlay = null;

    const abrirModal = () => {
      overlay = document.createElement('div');
      overlay.className = 'reservly-overlay';

      const modal = document.createElement('div');
      modal.className = 'reservly-modal';

      const header = document.createElement('div');
      header.className = 'reservly-modal-header';
      header.innerHTML = `
        <div class="reservly-modal-logo">
          ${LOGO_SVG}
          <span>Reservar cita</span>
        </div>
        <button class="reservly-modal-close" aria-label="Cerrar">✕</button>
      `;

      const iframe = document.createElement('iframe');
      iframe.className = 'reservly-iframe';
      iframe.src = `${baseUrl}/reservar/${slug}`;
      iframe.title = 'Reservar cita';
      iframe.allow = 'camera';

      const footer = document.createElement('div');
      footer.className = 'reservly-footer';
      footer.innerHTML = `Reservas gestionadas por <a href="${baseUrl}" target="_blank">Reservly</a>`;

      modal.appendChild(header);
      modal.appendChild(iframe);
      modal.appendChild(footer);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // Cerrar con botón
      header.querySelector('.reservly-modal-close').onclick = cerrarModal;

      // Cerrar con clic en overlay
      overlay.onclick = (e) => {
        if (e.target === overlay) cerrarModal();
      };

      // Cerrar con Escape
      document.addEventListener('keydown', handleEsc);

      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';
    };

    const cerrarModal = () => {
      if (overlay) {
        overlay.remove();
        overlay = null;
      }
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') cerrarModal();
    };

    btn.onclick = abrirModal;
  }

  // Inicializar todos los widgets de la página
  function init() {
    document.querySelectorAll('[data-reservly-slug]').forEach(initWidget);
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exponer API pública
  window.Reservly = { init };

})();