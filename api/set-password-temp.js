import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL

  if (!serviceKey || !supabaseUrl) {
    return res.status(500).json({ error: 'Service role not configured' })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.admin.updateUserById(
    'ac2150b6-fdc0-480f-8cb7-978b1514ea97',
    { password: 'MigraTrak2026!' }
  )

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ success: true, email: data.user?.email })
}
