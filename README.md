# Reservly

**Tus citas, en piloto automático.** SaaS de reservas y gestión para negocios locales: peluquerías, estética, fisioterapia y similares.

**[getreservly.com](https://getreservly.com)** · **[Ver la demo](https://getreservly.com/demo)** (sin registro, con datos de ejemplo)

## Qué incluye

**Para el negocio**
- Agenda por empleado y reservas con estados (confirmada, pendiente, cancelada)
- Clientes con ficha, historial y etiquetas (VIP, regular, nuevo)
- Empleados con comisiones (porcentaje o fijo) y vacaciones
- Servicios con duración, precio y categoría
- TPV para cobrar cada cita, con bonos y descuentos
- Stock con escáner de códigos de barras desde la cámara e historial de movimientos
- Fidelización, valoraciones y estadísticas de facturación
- Exportación a Excel y PDF, y copias de seguridad

**Para sus clientes**
- Página pública de reserva por negocio (`/reservar/:slug`) y perfil público
- Widget embebible para la web del negocio (`widget.js`) y QR imprimible
- Notificaciones y sincronización con Google Calendar

**Como producto**
- Tres planes con Stripe Checkout y control de acceso por plan en la interfaz
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

- **Row Level Security en las 13 tablas** (19 políticas): cada negocio solo accede a sus propios datos, aunque alguien manipule el cliente (`src/supabase/schema.sql`).
- **Claves fuera del código:** solo variables de entorno; la clave de servicio de Supabase y la de Stripe viven únicamente en el servidor (`/api`).
- **Webhook de Stripe** verificado con `constructEvent` antes de tocar ningún dato.
- Cabeceras de seguridad en Vercel; solo la página de reserva puede incrustarse en otras webs, para que funcione el widget.

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
