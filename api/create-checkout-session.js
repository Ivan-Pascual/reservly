const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { negocioId, email, nombreNegocio } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
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
      success_url: `${process.env.REACT_APP_BASE_URL}/dashboard?pago=ok`,
      cancel_url:  `${process.env.REACT_APP_BASE_URL}/ajustes?pago=cancelado`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};