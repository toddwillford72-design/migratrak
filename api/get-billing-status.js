import Stripe from 'stripe'

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
  const { attorneyEmail, activeClientCount = 0 } = req.body
  if (!attorneyEmail) return res.status(400).json({ error: 'Missing attorneyEmail' })
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  try {
    const existing = await stripe.customers.list({ email: attorneyEmail, limit: 1 })
    const customer = existing.data[0] || null
    let subscription = null
    let subscriptionStatus = 'none'
    if (customer) {
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'active', limit: 1 })
      if (subs.data.length > 0) { subscription = subs.data[0]; subscriptionStatus = 'active' }
    }
    const perClientRate = perClientRateCents(activeClientCount)
    const perClientTotal = activeClientCount * perClientRate
    const totalMonthly = 4900 + perClientTotal
    return res.status(200).json({
      subscriptionStatus,
      currentPeriodEnd: subscription ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      breakdown: { directoryFee: 4900, activeClientCount, perClientRate, perClientTotal, totalMonthly }
    })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Stripe error' })
  }
}
