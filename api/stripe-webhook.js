const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);



module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Leer body raw
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: err.message });
  }

  const session = event.data.object;

  switch (event.type) {

    case 'checkout.session.completed': {
      const negocioId = session.metadata?.negocio_id;
      if (negocioId) {
        await supabase.from('negocios').update({
          plan:                    'solo',
          stripe_customer_id:      session.customer,
          stripe_subscription_id:  session.subscription,
        }).eq('id', negocioId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const customerId = session.customer;
      await supabase.from('negocios').update({
        plan:                   'free',
        stripe_subscription_id: null,
      }).eq('stripe_customer_id', customerId);
      break;
    }

    case 'invoice.payment_failed': {
      const customerId = session.customer;
      await supabase.from('negocios').update({
        plan: 'free',
      }).eq('stripe_customer_id', customerId);
      break;
    }
  }

  res.status(200).json({ received: true });
};