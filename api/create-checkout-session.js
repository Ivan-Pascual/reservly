const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { negocioId, email, nombreNegocio } = req.body;

  try {
    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      metadata: { negocio_id: negocioId },
      line_items: [{
        price_data: {
          currency: 'eur',
          recurring: { interval: 'month' },
          unit_amount: 1900,
          product_data: {
            name: 'Reservly Plan Solo',
            description: 'Gestión completa de reservas, clientes, TPV y stock.',
          },
        },
        quantity: 1,
      }],
      success_url: `${process.env.REACT_APP_BASE_URL}/pago/exito`,
      cancel_url: `${process.env.REACT_APP_BASE_URL}/pago/cancelado`,
    };

    // Solo añadir email si es válido
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