# Reservly

> Tus citas, en piloto automático.

SaaS de gestión de reservas y citas para negocios locales en España.

## Stack

- **Frontend:** React 18 + React Router
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Estilos:** CSS-in-JS inline
- **Deploy:** Vercel (frontend) + Supabase (backend)

## Requisitos

- Node.js 18+
- Cuenta en Supabase

## Instalación local
```bash
git clone https://github.com/tu-usuario/reservly.git
cd reservly
npm install
```

Crea el archivo `.env` en la raíz:
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-anon-key

Arranca el servidor de desarrollo:
```bash
npm start
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `REACT_APP_SUPABASE_URL` | URL del proyecto de Supabase |
| `REACT_APP_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |

## Base de datos

Las tablas necesarias están en `supabase/schema.sql`. Ejecuta el SQL en el editor de Supabase para crearlas.

## Estructura del proyecto
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx
│   │   └── Sidebar.jsx
│   └── ErrorBoundary.jsx
├── hooks/
│   └── useNegocio.js
├── pages/
│   ├── auth/Login.jsx
│   ├── onboarding/Onboarding.jsx
│   ├── dashboard/Dashboard.jsx
│   ├── reservas/Reservas.jsx
│   ├── clientes/
│   │   ├── Clientes.jsx
│   │   └── FichaCliente.jsx
│   ├── empleados/Empleados.jsx
│   ├── servicios/Servicios.jsx
│   ├── comisiones/Comisiones.jsx
│   ├── bonos/Bonos.jsx
│   ├── valoraciones/Valoraciones.jsx
│   ├── estadisticas/Estadisticas.jsx
│   ├── ajustes/Ajustes.jsx
│   ├── vacaciones/Vacaciones.jsx
│   ├── tpv/TPV.jsx
│   └── publica/PaginaPublica.jsx
├── supabase.js
└── App.js

## Planes

| Plan | Precio | Empleados |
|------|--------|-----------|
| Solo | 19 EUR/mes | 1 |
| Equipo | 39 EUR/mes | 5 |
| Negocio | 79 EUR/mes | Ilimitado |

## Página pública

Cada negocio tiene una URL pública en:
https://reservly.com/reservar/[slug-del-negocio]

## Contacto

- Web: [reservly.com](https://reservly.com)
- Email: hola@reservly.com