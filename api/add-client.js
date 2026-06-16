import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    email, name, visaType, familySize, caseStartDate, dependentAges,
    attorneyId, attorneyName, firmName,
  } = req.body

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
    // 1. Create auth user with temporary password
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: 'MigraTrak2026!',
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

    // 4. Send invitation email via Resend REST API (best-effort — non-fatal)
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (RESEND_API_KEY) {
      try {
        const displayAttorney = attorneyName || 'Your Attorney'
        const displayFirm = firmName || 'Maimone Legal'
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'MigraTrak <hello@migratrak.app>',
            to: email,
            subject: `${displayAttorney} has set up your MigraTrak account`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to MigraTrak</h2>
                <p>Hi ${name},</p>
                <p>${displayAttorney} at ${displayFirm} has set up your MigraTrak account
                to help guide you through your immigration journey.</p>
                <p>MigraTrak will help you track your milestones, manage documents,
                log expenses, and get answers from an AI coach — all in one place.</p>
                <p>To access your account, click the link below to set your password:</p>
                <a href="https://migratrak.vercel.app/auth"
                   style="background:#1B5FA8;color:white;padding:12px 24px;
                   border-radius:6px;text-decoration:none;display:inline-block;
                   margin:16px 0;">Access your MigraTrak account</a>
                <p style="color:#666;font-size:14px;">
                  Temporary password: <strong>MigraTrak2026!</strong><br>
                  Please change your password after first login.
                </p>
                <p>If you have any questions, contact your attorney directly.</p>
                <p>— The MigraTrak Team</p>
              </div>
            `,
          }),
        })
      } catch (_) {
        // invitation email failure is non-fatal
      }
    }

    return res.status(200).json({ success: true, clientId })
  } catch (err) {
    console.error('add-client error:', err)
    return res.status(500).json({ error: err.message || 'Failed to create client' })
  }
}
