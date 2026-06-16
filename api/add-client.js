import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, name, visaType, familySize, caseStartDate, dependentAges, attorneyId } = req.body

  if (!email || !name || !attorneyId) {
    return res.status(400).json({ error: 'Missing required fields: email, name, attorneyId' })
  }

  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL

  if (!serviceKey || !supabaseUrl) {
    return res.status(500).json({ error: 'Supabase service role not configured' })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    // 1. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    })
    if (authErr) throw authErr

    const clientId = authData.user.id

    // 2. Insert row into public.users
    const { error: userErr } = await supabase.from('users').insert({
      id: clientId,
      email,
      name,
      role: 'client',
      visa_type: visaType || null,
      family_size: familySize || 1,
      case_start_date: caseStartDate || null,
      dependent_ages: Array.isArray(dependentAges) ? dependentAges : [],
      origin_country: 'Canada',
    })
    if (userErr) throw userErr

    // 3. Insert row into attorney_clients
    const { error: linkErr } = await supabase.from('attorney_clients').insert({
      attorney_id: attorneyId,
      client_id: clientId,
      status: 'active',
    })
    if (linkErr) throw linkErr

    // 4. Fire invitation email (best-effort — don't fail client creation if email errors)
    try {
      const host = req.headers.host || ''
      const protocol = host.startsWith('localhost') ? 'http' : 'https'
      await fetch(`${protocol}://${host}/api/send-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: email,
          clientName: name,
          attorneyName: req.body.attorneyName || 'Your attorney',
          firmName: req.body.firmName || '',
        }),
      })
    } catch (_) {
      // invitation email failure is non-fatal
    }

    return res.status(200).json({ success: true, clientId })
  } catch (err) {
    console.error('add-client error:', err)
    return res.status(500).json({ error: err.message || 'Failed to create client' })
  }
}
