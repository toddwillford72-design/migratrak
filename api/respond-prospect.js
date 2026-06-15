export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const RESEND_API_KEY   = process.env.RESEND_API_KEY
  const SUPABASE_URL     = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!RESEND_API_KEY)   return res.status(500).json({ error: 'Email service not configured' })
  if (!SUPABASE_URL)     return res.status(500).json({ error: 'Database not configured' })

  const { action, prospectId, prospectName, prospectEmail, attorneyName, firmName, visaType } = req.body

  if (!action || !prospectId || !prospectName || !prospectEmail || !attorneyName) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const firm = firmName || `${attorneyName}'s office`
  let subject, html, newStatus

  if (action === 'approve') {
    newStatus = 'approved'
    subject   = `Your consultation request — ${firm}`
    html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0D2B4E; padding: 24px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">${firm}</h1>
        <p style="color: #4A9FD4; margin: 8px 0 0 0; font-size: 13px;">Immigration Law</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #0D2B4E; font-size: 16px; font-weight: bold;">Hi ${prospectName},</p>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Thank you for your interest in a ${visaType || 'visa'} consultation. I have reviewed your information and I would be happy to speak with you.</p>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Please choose one of the following available times for your consultation:</p>
        <div style="background-color: #F7F9FC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="color: #0D2B4E; font-size: 14px; font-weight: bold; margin: 0 0 12px 0;">Available consultation slots:</p>
          <p style="color: #4A5568; font-size: 14px; margin: 8px 0;">Monday at 10:00 AM ET</p>
          <p style="color: #4A5568; font-size: 14px; margin: 8px 0;">Wednesday at 2:00 PM ET</p>
          <p style="color: #4A5568; font-size: 14px; margin: 8px 0;">Friday at 11:00 AM ET</p>
        </div>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Simply reply to this email with your preferred time and I will send you a calendar invite.</p>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">In the meantime your MigraTrak account is ready to use.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto;">
          <tr><td style="border-radius: 8px; background-color: #1A7A4A;">
            <a href="https://migratrak.vercel.app/j1" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold; color: #FFFFFF; text-decoration: none; border-radius: 8px;">Open my MigraTrak dashboard</a>
          </td></tr>
        </table>
        <p style="color: #0D2B4E; font-size: 15px; font-weight: bold; margin: 4px 0;">${attorneyName}</p>
        <p style="color: #64748B; font-size: 13px; margin: 4px 0;">${firm}</p>
      </div>
      <div style="background-color: #F7F9FC; padding: 16px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
        <p style="color: #A0AEC0; font-size: 11px; margin: 0;">MigraTrak provides educational information only — not legal advice. Always consult your immigration attorney for guidance specific to your situation.</p>
      </div>
    </div>`

  } else if (action === 'decline') {
    newStatus = 'declined'
    subject   = `Your consultation inquiry — ${firm}`
    html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0D2B4E; padding: 24px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">${firm}</h1>
        <p style="color: #4A9FD4; margin: 8px 0 0 0; font-size: 13px;">Immigration Law</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #0D2B4E; font-size: 16px; font-weight: bold;">Hi ${prospectName},</p>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Thank you for reaching out about your ${visaType || 'immigration'} inquiry. After reviewing your information I do not think I am the right fit for your specific situation — but I want to make sure you get the help you need.</p>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">I would encourage you to consult with another qualified immigration attorney. You can find vetted specialists through your MigraTrak professional directory:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto;">
          <tr><td style="border-radius: 8px; background-color: #1B5FA8;">
            <a href="https://migratrak.vercel.app/j5" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold; color: #FFFFFF; text-decoration: none; border-radius: 8px;">Find an immigration attorney</a>
          </td></tr>
        </table>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Your MigraTrak account remains active. I wish you all the best with your journey.</p>
        <p style="color: #0D2B4E; font-size: 15px; font-weight: bold; margin: 4px 0;">${attorneyName}</p>
        <p style="color: #64748B; font-size: 13px; margin: 4px 0;">${firm}</p>
      </div>
      <div style="background-color: #F7F9FC; padding: 16px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
        <p style="color: #A0AEC0; font-size: 11px; margin: 0;">MigraTrak provides educational information only — not legal advice.</p>
      </div>
    </div>`

  } else if (action === 'more_info') {
    newStatus = 'info_requested'
    subject   = `A few questions before your consultation — ${firm}`
    html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0D2B4E; padding: 24px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">${firm}</h1>
        <p style="color: #4A9FD4; margin: 8px 0 0 0; font-size: 13px;">Immigration Law</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #0D2B4E; font-size: 16px; font-weight: bold;">Hi ${prospectName},</p>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Thank you for your interest in a ${visaType || 'visa'} consultation. Before we schedule a call I would like to learn a bit more about your situation so I can make our time together as productive as possible.</p>
        <div style="background-color: #F7F9FC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="color: #0D2B4E; font-size: 14px; font-weight: bold; margin: 0 0 12px 0;">Could you please reply with:</p>
          <p style="color: #4A5568; font-size: 14px; margin: 8px 0;">1. What type of business are you considering purchasing or starting?</p>
          <p style="color: #4A5568; font-size: 14px; margin: 8px 0;">2. What is your approximate available investment budget?</p>
          <p style="color: #4A5568; font-size: 14px; margin: 8px 0;">3. What is your ideal timeline for completing the visa process?</p>
          <p style="color: #4A5568; font-size: 14px; margin: 8px 0;">4. Have you previously applied for any US visa? If so, which one?</p>
        </div>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Once I have this information I will be in touch to schedule your consultation.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto;">
          <tr><td style="border-radius: 8px; background-color: #1B5FA8;">
            <a href="https://migratrak.vercel.app/j1" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold; color: #FFFFFF; text-decoration: none; border-radius: 8px;">Open my MigraTrak dashboard</a>
          </td></tr>
        </table>
        <p style="color: #0D2B4E; font-size: 15px; font-weight: bold; margin: 4px 0;">${attorneyName}</p>
        <p style="color: #64748B; font-size: 13px; margin: 4px 0;">${firm}</p>
      </div>
      <div style="background-color: #F7F9FC; padding: 16px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
        <p style="color: #A0AEC0; font-size: 11px; margin: 0;">MigraTrak provides educational information only — not legal advice.</p>
      </div>
    </div>`

  } else {
    return res.status(400).json({ error: `Unknown action: ${action}` })
  }

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `${firm} <hello@migratrak.app>`, to: [prospectEmail], subject, html }),
    })
    const emailData = await emailRes.json()
    if (!emailRes.ok) throw new Error(emailData.message || 'Email send failed')

    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/prospects?id=eq.${prospectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE, 'Authorization': `Bearer ${SUPABASE_SERVICE}` },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!updateRes.ok) throw new Error('Status update failed')

    return res.status(200).json({ success: true, action, newStatus, emailId: emailData.id })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Response failed' })
  }
}
