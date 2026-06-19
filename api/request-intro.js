// Sends an introduction email to hello@migratrak.app when a logged-in client
// requests an introduction to a directory professional who does not have a
// MigraTrak account. Todd forwards these manually during beta.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'Email service not configured' })

  const {
    prospect_name,
    prospect_email,
    visa_type,
    budget_range,
    ai_note,
    professional_name,
    professional_firm,
    professional_category,
  } = req.body

  if (!prospect_name || !prospect_email || !professional_name) {
    return res.status(400).json({ error: 'prospect_name, prospect_email, and professional_name are required' })
  }

  const subject = `MigraTrak intro request — ${prospect_name} → ${professional_name}`

  const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #0D2B4E; padding: 24px;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 20px;">MigraTrak</h1>
      <p style="color: #4A9FD4; margin: 6px 0 0 0; font-size: 12px;">New Directory Introduction Request</p>
    </div>
    <div style="padding: 28px 24px; background: #FFFFFF;">
      <p style="color: #0D2B4E; font-size: 15px; font-weight: bold; margin: 0 0 16px 0;">
        A MigraTrak client has requested an introduction to ${professional_name}.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #4A5568; width: 160px;">Professional</td>
          <td style="padding: 10px 0; font-size: 13px; color: #0D2B4E;">${professional_name}${professional_firm ? ` — ${professional_firm}` : ''}${professional_category ? ` (${professional_category})` : ''}</td>
        </tr>
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #4A5568;">Client name</td>
          <td style="padding: 10px 0; font-size: 13px; color: #0D2B4E;">${prospect_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #4A5568;">Client email</td>
          <td style="padding: 10px 0; font-size: 13px; color: #1B5FA8;"><a href="mailto:${prospect_email}" style="color: #1B5FA8;">${prospect_email}</a></td>
        </tr>
        ${visa_type ? `<tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #4A5568;">Visa type</td>
          <td style="padding: 10px 0; font-size: 13px; color: #0D2B4E;">${visa_type.toUpperCase()}</td>
        </tr>` : ''}
        ${budget_range ? `<tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #4A5568;">Budget range</td>
          <td style="padding: 10px 0; font-size: 13px; color: #0D2B4E;">${budget_range}</td>
        </tr>` : ''}
        ${ai_note ? `<tr>
          <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #4A5568;">AI summary</td>
          <td style="padding: 10px 0; font-size: 13px; color: #4A5568; font-style: italic;">${ai_note}</td>
        </tr>` : ''}
      </table>

      <p style="font-size: 13px; color: #64748B; line-height: 1.6;">
        This introduction came through the MigraTrak professional directory. The client's account is active. Please reach out to ${prospect_email} directly to introduce ${professional_name}.
      </p>
    </div>
    <div style="background-color: #F7F9FC; padding: 14px 24px; border-top: 1px solid #E2E8F0;">
      <p style="color: #A0AEC0; font-size: 11px; margin: 0;">MigraTrak provides educational information only — not legal advice.</p>
    </div>
  </div>`

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'MigraTrak <hello@migratrak.app>',
        to: ['hello@migratrak.app'],
        subject,
        html,
      }),
    })
    const emailData = await emailRes.json()
    if (!emailRes.ok) throw new Error(emailData.message || 'Email send failed')

    return res.status(200).json({ success: true, emailId: emailData.id })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send introduction request' })
  }
}
