const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const PRECIOS = {
  basico:  { amount: 1900, nombre: 'Reservly Plan Básico',  desc: 'Hasta 2 empleados. Reservas, TPV y stock.' },
  pro:     { amount: 3900, nombre: 'Reservly Plan Pro',     desc: 'Empleados ilimitados. WhatsApp, fidelización y widget.' },
  agencia: { amount: 7900, nombre: 'Reservly Plan Agencia', desc: 'Multi-sede, factura electrónica y API.' },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { negocioId, email, nombreNegocio, plan = 'basico' } = req.body;
  const precio = PRECIOS[plan] || PRECIOS.basico;

  try {
    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      metadata: { negocio_id: negocioId, plan },
      line_items: [{
        price_data: {
          currency: 'eur',
          recurring: { interval: 'month' },
          unit_amount: precio.amount,
          product_data: {
            name: precio.nombre,
            description: precio.desc,
          },
        },
        quantity: 1,
      }],
      success_url: `${process.env.REACT_APP_BASE_URL}/dashboard?pago=ok`,
      cancel_url:  `${process.env.REACT_APP_BASE_URL}/pago/cancelado`,
    };

    if (email && email.includes('@')) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};