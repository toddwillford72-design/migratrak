const SUPABASE_URL      = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const RESEND_API_KEY    = process.env.RESEND_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const PROCESSING_BENCHMARKS = {
  'eb5':    { min: 29, max: 48, label: 'EB-5 Investor' },
  'e2':     { min: 3,  max: 6,  label: 'E-2 Treaty Investor' },
  'tn':     { min: 0,  max: 1,  label: 'TN' },
  'l1':     { min: 6,  max: 12, label: 'L-1' },
  'h1b':    { min: 3,  max: 6,  label: 'H-1B' },
  'o1':     { min: 4,  max: 8,  label: 'O-1' },
  'k1':     { min: 12, max: 15, label: 'K-1 Fiancé' },
  'eb2niw': { min: 24, max: 36, label: 'EB-2 NIW' },
}

function daysSince(dateStr) {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function monthsSince(dateStr) {
  const days = daysSince(dateStr)
  return days !== null ? Math.floor(days / 30) : null
}

function shouldSendCheckin(client, lastCheckin) {
  const months = monthsSince(client.case_start_date)
  if (months === null) return null
  if (lastCheckin?.client_responded && daysSince(lastCheckin.sent_at) < 7) return null
  if (lastCheckin && daysSince(lastCheckin.sent_at) < 14) return null
  if (months === 1 && !lastCheckin) return 'day_30'
  if (months === 2 && (!lastCheckin || lastCheckin.trigger_reason === 'day_30')) return 'day_60'
  if (months === 3 && (!lastCheckin || !['day_90', 'monthly'].includes(lastCheckin.trigger_reason))) return 'day_90'
  if (months > 3) {
    if (!lastCheckin) return 'monthly'
    if (daysSince(lastCheckin.sent_at) >= 30) return 'monthly'
  }
  return null
}

async function generateMessage(client, attorney, triggerReason) {
  const visaKey = (client.visa_type || '').toLowerCase().replace(/[-\s]/g, '')
  const benchmark = PROCESSING_BENCHMARKS[visaKey] || { min: 6, max: 24, label: client.visa_type || 'visa' }
  const months = monthsSince(client.case_start_date) || 1
  const firmName = attorney.firm_name || attorney.name + "'s office"
  const prompt = `You are writing a brief, warm check-in email from an immigration attorney to their client.
Attorney: ${attorney.name} at ${firmName}
Client: ${client.name}
Visa type: ${benchmark.label}
Months since case start: ${months}
USCIS processing benchmark: ${benchmark.min}-${benchmark.max} months
Write ONE paragraph (3-4 sentences max) that addresses the client by first name, notes their current timeline, normalizes the wait, reassures them, and points to their MigraTrak dashboard.
Tone: warm, professional, reassuring. No legal advice.
End with: "— ${attorney.name}, ${firmName}"
Respond with only the email body text. No subject line. No HTML.`
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await response.json()
    return data.content?.[0]?.text?.trim() || null
  } catch (_) { return null }
}

function buildEmailHtml(messageBody, firmName, dashboardUrl) {
  const paragraphs = messageBody.split('\n').filter(Boolean)
  const bodyHtml = paragraphs.map(p => `<p style="color: #4A5568; font-size: 15px; line-height: 1.7; margin: 0 0 12px 0;">${p}</p>`).join('')
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #0D2B4E; padding: 24px; text-align: center;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 20px;">${firmName}</h1>
      <p style="color: #4A9FD4; margin: 6px 0 0 0; font-size: 12px;">Immigration Law</p>
    </div>
    <div style="padding: 32px 24px;">${bodyHtml}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto;">
        <tr><td style="border-radius: 8px; background-color: #1B5FA8;">
          <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #FFFFFF; text-decoration: none; border-radius: 8px;">Open my MigraTrak dashboard</a>
        </td></tr>
      </table>
    </div>
    <div style="background-color: #F7F9FC; padding: 16px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
      <p style="color: #A0AEC0; font-size: 11px; margin: 0;">MigraTrak provides educational information only — not legal advice. Always consult your immigration attorney for guidance specific to your situation.</p>
    </div>
  </div>`
}

async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE, 'Authorization': `Bearer ${SUPABASE_SERVICE}`, ...(options.headers || {}) },
  })
  if (!res.ok) { const body = await res.text(); throw new Error(`Supabase ${path} failed: ${body}`) }
  return res.json()
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!SUPABASE_URL || !RESEND_API_KEY) return res.status(500).json({ error: 'Missing required environment variables' })

  const results = { evaluated: 0, sent: 0, skipped: 0, errors: [] }

  try {
    const links = await supabaseFetch('attorney_clients?status=eq.active&select=attorney_id,client_id')
    if (!links || links.length === 0) return res.status(200).json({ ...results, message: 'No active clients found' })

    const clientIds   = [...new Set(links.map(l => l.client_id))]
    const attorneyIds = [...new Set(links.map(l => l.attorney_id))]

    const [clients, attorneys] = await Promise.all([
      supabaseFetch(`users?id=in.(${clientIds.join(',')})&select=id,name,email,visa_type,case_start_date`),
      supabaseFetch(`users?id=in.(${attorneyIds.join(',')})&select=id,name,email,firm_name`),
    ])

    const clientMap   = Object.fromEntries(clients.map(c => [c.id, c]))
    const attorneyMap = Object.fromEntries(attorneys.map(a => [a.id, a]))

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
    const recentCheckins = await supabaseFetch(`checkins?client_id=in.(${clientIds.join(',')})&sent_at=gte.${thirtyDaysAgo}&order=sent_at.desc&select=*`)

    const lastCheckinMap = {}
    for (const checkin of recentCheckins) {
      if (!lastCheckinMap[checkin.client_id]) lastCheckinMap[checkin.client_id] = checkin
    }

    for (const link of links) {
      const client   = clientMap[link.client_id]
      const attorney = attorneyMap[link.attorney_id]
      if (!client || !attorney) continue
      results.evaluated++

      const triggerReason = shouldSendCheckin(client, lastCheckinMap[client.id])
      if (!triggerReason) { results.skipped++; continue }

      try {
        const messageBody = await generateMessage(client, attorney, triggerReason)
        if (!messageBody) { results.errors.push(`No message for ${client.email}`); continue }

        const firmName = attorney.firm_name || attorney.name + "'s office"
        const emailHtml = buildEmailHtml(messageBody, firmName, 'https://migratrak.vercel.app/j1')

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: `${firmName} <hello@migratrak.app>`, to: [client.email], subject: `A quick update on your case — ${firmName}`, html: emailHtml }),
        })
        if (!emailRes.ok) { const e = await emailRes.json(); throw new Error(e.message || 'Email failed') }

        await supabaseFetch('checkins', {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({ client_id: client.id, attorney_id: attorney.id, trigger_reason: triggerReason, message_body: messageBody, sent_at: new Date().toISOString() }),
        })
        results.sent++
      } catch (clientErr) { results.errors.push(`${client.email}: ${clientErr.message}`) }
    }

    return res.status(200).json(results)
  } catch (err) {
    return res.status(500).json({ error: err.message, ...results })
  }
}
