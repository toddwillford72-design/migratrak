export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { clientEmail, clientName, attorneyName, firmName } = req.body

  if (!clientEmail || !clientName || !attorneyName) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' })
  }

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0D2B4E; padding: 24px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">MIGRATRAK</h1>
        <p style="color: #4A9FD4; margin: 8px 0 0 0; font-size: 14px;">Your Relocation Companion</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #0D2B4E; font-size: 16px;">Hi ${clientName},</p>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">
          ${attorneyName} at ${firmName || 'your immigration law firm'} has set up your MigraTrak account —
          a guided companion to help you navigate every step of your US immigration journey.
        </p>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">MigraTrak helps you:</p>
        <ul style="color: #4A5568; font-size: 15px; line-height: 1.8;">
          <li>Track every milestone in your visa journey</li>
          <li>Document and organize your investment expenses</li>
          <li>Store and monitor your required documents</li>
          <li>Ask immigration questions to an AI coach anytime</li>
          <li>Access vetted professionals and essential services</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://migratrak.vercel.app/auth"
             style="background-color: #F0A500; color: #0D2B4E; padding: 14px 32px;
                    text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Access Your MigraTrak Account →
          </a>
        </div>
        <p style="color: #A0AEC0; font-size: 13px; line-height: 1.6;">
          MigraTrak provides educational information only — not legal advice.
          Always consult your immigration attorney for guidance specific to your situation.
        </p>
      </div>
      <div style="background-color: #F7F9FC; padding: 16px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
        <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
          © 2026 MigraTrak — FieldCore Holdings. All rights reserved.
        </p>
      </div>
    </div>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MigraTrak <hello@migratrak.app>',
        to: [clientEmail],
        subject: `${attorneyName} has set up your MigraTrak account`,
        html: emailBody,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: data.message || 'Failed to send email' })
    }

    return res.status(200).json({ success: true, id: data.id })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send email' })
  }
}
