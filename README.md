# Reservly
![CI](https://github.com/Ivan-Pascual/reservly/actions/workflows/ci.yml/badge.svg)

> **Estado:** prototipo funcional en fase de validación. Todavía no lo usa ningún negocio real.

SaaS de reservas y gestión para negocios locales como peluquerías, centros de estética y fisioterapia.

**Web:** [getreservly.com](https://getreservly.com) · **Demo:** [getreservly.com/demo](https://getreservly.com/demo) (sin registro, con datos de ejemplo)

## Qué incluye

**Para el negocio**
- Agenda por empleado y reservas con estados (confirmada, pendiente, cancelada)
- Fichas de clientes con historial y etiquetas
- Empleados con comisiones (porcentaje o fijo) y vacaciones
- Servicios con duración, precio y categoría
- TPV para cobrar cada cita, con bonos y descuentos
- Stock con escáner de códigos de barras desde la cámara
- Estadísticas de facturación y exportación a Excel y PDF

**Para sus clientes**
- Página pública de reserva por negocio (`/reservar/:slug`)
- Widget embebible para la web del negocio

**Producto**
- Tres planes con Stripe Checkout y control de acceso por plan

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, React Router 7, Create React App, PWA con Service Worker |
| Backend | Supabase: PostgreSQL, Auth y Row Level Security |
| Pagos | Stripe Checkout y webhook en funciones serverless de Vercel |
| Documentos | jsPDF y SheetJS |
| Escáner | ZXing |
| Despliegue | Vercel |

## Decisiones de seguridad

- **Row Level Security activado en todas las tablas** (`src/supabase/schema.sql`). Los usuarios autenticados solo acceden a los datos de su propio negocio.
- **Lectura pública limitada:** la página de reserva lee datos de disponibilidad sin autenticación. Este apartado se está revisando para que no exponga datos personales ni de facturación.
- **Claves fuera del código:** solo variables de entorno. La clave de servicio de Supabase y la de Stripe viven únicamente en el servidor (`/api`).
- **Webhook de Stripe verificado** con `constructEvent` antes de modificar cualquier dato.


## Arrancar en local

```bash
npm install
cp .env.example .env    # y rellena tus valores
npm start               # http://localhost:3000
npm test
```

Base de datos: crea un proyecto en Supabase y ejecuta `src/supabase/schema.sql` en el SQL Editor.

## Autor y licencia

[Iván Pascual López](https://github.com/Ivan-Pascual) · Junior AI & FullStack Developer · Licencia MIT
