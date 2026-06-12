import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { attorneyId } = req.body
  if (!attorneyId) {
    return res.status(400).json({ error: 'Missing attorneyId' })
  }

  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL

  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    const { data: links, error: linksErr } = await supabase
      .from('attorney_clients')
      .select('client_id')
      .eq('attorney_id', attorneyId)
      .eq('status', 'active')

    if (linksErr) throw linksErr
    if (!links || links.length === 0) {
      return res.status(200).json({ clients: [] })
    }

    const clientIds = links.map(l => l.client_id)

    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('id, name, email, visa_type, dependent_ages')
      .in('id', clientIds)

    if (usersErr) throw usersErr

    const { data: milestones } = await supabase
      .from('milestones')
      .select('user_id, status')
      .in('user_id', clientIds)

    const progressMap = {}
    clientIds.forEach(cid => {
      const ms = (milestones || []).filter(m => m.user_id === cid)
      if (ms.length > 0) {
        const done = ms.filter(m => m.status === 'complete').length
        progressMap[cid] = Math.round((done / ms.length) * 100)
      } else {
        progressMap[cid] = 0
      }
    })

    const enriched = (users || []).map(u => ({
      ...u,
      progress: progressMap[u.id] ?? 0,
      detail: u.visa_type
        ? `${u.visa_type} · ${progressMap[u.id] ?? 0}% complete`
        : `${progressMap[u.id] ?? 0}% complete`,
    }))

    return res.status(200).json({ clients: enriched })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to load clients' })
  }
}
