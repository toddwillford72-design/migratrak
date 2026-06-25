import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { usersRow, visaType } = req.body

  try {
    const { error: profileError } = await supabase
      .from('users')
      .upsert(usersRow, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile insert error:', profileError)
      return res.status(500).json({ error: profileError.message })
    }

    if (visaType && usersRow.role === 'client') {
      const { error: seedError } = await supabase.rpc('seed_milestones_for_user', {
        p_user_id: usersRow.id,
        p_visa_type: visaType
      })
      if (seedError) console.error('Milestone seed error:', seedError)
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('create-profile error:', err)
    return res.status(500).json({ error: err.message })
  }
}
