export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const SUPABASE_URL     = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!SUPABASE_URL) return res.status(500).json({ error: 'Database not configured' })

  const { prospectId, attorneyId, zapierWebhookUrl } = req.body
  if (!prospectId || !attorneyId) return res.status(400).json({ error: 'Missing required fields' })

  const headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE, 'Authorization': `Bearer ${SUPABASE_SERVICE}` }

  try {
    const prospectRes = await fetch(`${SUPABASE_URL}/rest/v1/prospects?id=eq.${prospectId}&select=*`, { headers })
    if (!prospectRes.ok) throw new Error('Could not fetch prospect')
    const prospects = await prospectRes.json()
    const prospect = prospects[0]
    if (!prospect) throw new Error('Prospect not found')

    let clientId = null
    const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(prospect.email)}&select=id`, { headers })
    if (userRes.ok) {
      const users = await userRes.json()
      if (users.length > 0) clientId = users[0].id
    }

    if (clientId) {
      const existingRes = await fetch(`${SUPABASE_URL}/rest/v1/attorney_clients?attorney_id=eq.${attorneyId}&client_id=eq.${clientId}&select=id`, { headers })
      const existing = existingRes.ok ? await existingRes.json() : []
      if (existing.length === 0) {
        const linkRes = await fetch(`${SUPABASE_URL}/rest/v1/attorney_clients`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify({ attorney_id: attorneyId, client_id: clientId, status: 'active', activated_at: new Date().toISOString() }),
        })
        if (!linkRes.ok) throw new Error('Failed to create client link')
      }
    }

    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/prospects?id=eq.${prospectId}`, {
      method: 'PATCH', headers, body: JSON.stringify({ status: 'converted' }),
    })
    if (!updateRes.ok) throw new Error('Failed to update prospect status')

    let webhookFired = false
    if (zapierWebhookUrl && zapierWebhookUrl.startsWith('https://hooks.zapier.com/')) {
      try {
        const zapRes = await fetch(zapierWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prospect_id: prospect.id, name: prospect.name, email: prospect.email, phone: prospect.phone || null,
            visa_type: prospect.visa_type, budget_range: prospect.budget_range, destination_state: prospect.destination_state,
            family_size: prospect.family_size, dependent_ages: prospect.dependent_ages,
            score: prospect.score, fit_rating: prospect.fit_rating, complexity: prospect.complexity,
            ai_consultation_note: prospect.ai_consultation_note, assessment_answers: prospect.assessment_answers,
            attorney_id: prospect.attorney_id, client_id: clientId,
            migratrak_prospect_url: 'https://migratrak.vercel.app/a1',
            converted_at: new Date().toISOString(), source: 'migratrak',
          }),
        })
        webhookFired = zapRes.ok
      } catch { webhookFired = false }
    }

    return res.status(200).json({ success: true, clientId, clientLinked: !!clientId, webhookFired, prospectId })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Conversion failed' })
  }
}
