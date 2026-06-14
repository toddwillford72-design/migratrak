import Stripe from 'stripe'

const DIRECTORY_FEE_CENTS = 4900

function perClientRateCents(n) {
  if (n >= 100) return 600
  if (n >= 50)  return 800
  if (n >= 25)  return 1000
  if (n >= 10)  return 1200
  return 1500
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
  if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' })
  const { attorneyEmail, attorneyName, firmName, activeClientCount = 0 } = req.body
  if (!attorneyEmail || !attorneyName) return res.status(400).json({ error: 'Missing required fields' })
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  try {
    const existing = await stripe.customers.list({ email: attorneyEmail, limit: 1 })
    const customer = existing.data.length > 0
      ? existing.data[0]
      : await stripe.customers.create({ email: attorneyEmail, name: attorneyName, metadata: { firmName: firmName || '', platform: 'migratrak' } })
    const perClientRate = perClientRateCents(activeClientCount)
    const perClientTotal = activeClientCount * perClientRate
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        { price_data: { currency: 'usd', product_data: { name: 'MigraTrak Directory Listing', description: 'Monthly directory listing' }, unit_amount: DIRECTORY_FEE_CENTS, recurring: { interval: 'month' } }, quantity: 1 },
        ...(activeClientCount > 0 ? [{ price_data: { currency: 'usd', product_data: { name: 'MigraTrak Per-Client Fee', description: `${activeClientCount} active clients x $${(perClientRate/100).toFixed(0)}/client/month` }, unit_amount: perClientRate, recurring: { interval: 'month' } }, quantity: activeClientCount }] : []),
      ],
      success_url: 'https://migratrak.vercel.app/a1?billing=success',
      cancel_url: 'https://migratrak.vercel.app/a1?billing=cancelled',
      metadata: { attorneyEmail, firmName: firmName || '', activeClientCount: String(activeClientCount), platform: 'migratrak' },
    })
    return res.status(200).json({ sessionUrl: session.url, customerId: customer.id })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Stripe error' })
  }
}
