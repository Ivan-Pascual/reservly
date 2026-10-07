# Reservly

**Tus citas, en piloto automático.** SaaS de reservas y gestión para negocios locales: peluquerías, estética, fisioterapia y similares.

**[Ver la demo](https://reservly-yqwz.vercel.app/demo)** · sin registro, con datos de ejemplo

<!-- Capturas: añade aquí 3-4 imágenes (agenda, ficha de cliente, página pública de reserva y TPV) en docs/capturas/ -->

## Qué incluye

**Para el negocio**
- Agenda por empleado y gestión de reservas con estados (confirmada, pendiente, cancelada)
- Clientes con ficha, historial y etiquetas (VIP, regular, nuevo)
- Empleados con comisiones (porcentaje o fijo) y vacaciones
- Servicios con duración, precio y categoría
- TPV para cobrar cada cita, bonos y descuentos
- Stock con escáner de códigos de barras desde la cámara e historial de movimientos
- Fidelización, valoraciones y reseñas de clientes
- Estadísticas de facturación y actividad
- Exportación a Excel y PDF, y copias de seguridad

**Para sus clientes**
- Página pública de reserva por negocio (`/reservar/:slug`) y perfil público
- Widget embebible para la web del negocio (`widget.js`)
- QR imprimible que lleva a la página de reserva
- Notificaciones y sincronización con Google Calendar

**Negocio**
- Tres planes de suscripción con Stripe Checkout y webhook con verificación de firma
- Control de acceso por plan en la interfaz (`PlanGate`)
- Landing, precios, comparativa y textos legales

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, React Router 7 (Create React App), PWA con Service Worker |
| Backend | Supabase: PostgreSQL, Auth y Row Level Security |
| Pagos | Stripe Checkout + webhook en funciones serverless de Vercel |
| Documentos | jsPDF y SheetJS |
| Escáner | ZXing |
| Despliegue | Vercel |

## Seguridad

- **Row Level Security en las 13 tablas** con 19 políticas: cada negocio solo accede a sus propios datos, aunque alguien manipule el cliente (`src/supabase/schema.sql`).
- **Claves fuera del código:** solo variables de entorno; la clave de servicio de Supabase y la de Stripe viven únicamente en el servidor (`/api`).
- **Webhook de Stripe** verificado con `constructEvent` antes de tocar ningún dato.
- Cabeceras de seguridad en Vercel; la página de reserva permite incrustarse para que funcione el widget.

## Arrancar en local

```bash
npm install
cp .env.example .env    # y rellena tus valores
npm start               # http://localhost:3000
npm test
```

Base de datos: crea un proyecto en Supabase y ejecuta `src/supabase/schema.sql` en el SQL Editor.

## Estructura

```
api/                    funciones serverless (Stripe Checkout y webhook)
public/widget.js        widget embebible para webs de negocios
src/pages/              una carpeta por sección (agenda, clientes, tpv, stock…)
src/components/         layout, búsqueda global, control de planes
src/hooks/              negocio actual, plan, móvil
src/services/           exportar, copias, notificaciones, Google Calendar
src/supabase/schema.sql esquema y políticas RLS
```

## Autor

[Iván Pascual López](https://github.com/Ivan-Pascual) · Junior AI & FullStack Developer

## Licencia

MIT
