import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { attorneyId } = req.body
  if (!attorneyId) return res.status(400).json({ error: 'Missing attorneyId' })

  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    const { data: links, error: linksErr } = await supabase
      .from('attorney_clients')
      .select('client_id, activated_at')
      .eq('attorney_id', attorneyId)
      .eq('status', 'active')

    if (linksErr) throw linksErr
    if (!links || links.length === 0) {
      return res.status(200).json({ clients: [], metrics: { newClients: 0, milestonesCompleted: 0, avgProgress: 0, docsFlagged: 0 } })
    }

    const clientIds = links.map(l => l.client_id)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [usersRes, milestonesRes, documentsRes] = await Promise.all([
      supabase.from('users').select('id, name, email, visa_type, dependent_ages, last_sign_in_at').in('id', clientIds),
      supabase.from('milestones').select('user_id, status, completed_date').in('user_id', clientIds),
      supabase.from('documents').select('user_id, flagged').in('user_id', clientIds).eq('flagged', true),
    ])

    if (usersRes.error) throw usersRes.error

    const milestones = milestonesRes.data || []

    const progressMap = {}
    clientIds.forEach(cid => {
      const ms = milestones.filter(m => m.user_id === cid)
      if (ms.length > 0) {
        const done = ms.filter(m => m.status === 'complete').length
        progressMap[cid] = Math.round((done / ms.length) * 100)
      } else {
        progressMap[cid] = 0
      }
    })

    const enriched = (usersRes.data || []).map(u => ({
      ...u,
      progress: progressMap[u.id] ?? 0,
      detail: u.visa_type
        ? `${u.visa_type} · ${progressMap[u.id] ?? 0}% complete`
        : `${progressMap[u.id] ?? 0}% complete`,
    }))

    const newClients = links.filter(l => l.activated_at && new Date(l.activated_at) >= new Date(monthStart)).length
    const milestonesCompleted = milestones.filter(m => m.status === 'complete' && m.completed_date && new Date(m.completed_date) >= new Date(monthStart)).length
    const avgProgress = clientIds.length > 0
      ? Math.round(clientIds.reduce((sum, cid) => sum + (progressMap[cid] ?? 0), 0) / clientIds.length)
      : 0
    const docsFlagged = (documentsRes.data || []).length

    return res.status(200).json({
      clients: enriched,
      metrics: { newClients, milestonesCompleted, avgProgress, docsFlagged }
    })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to load clients' })
  }
}
