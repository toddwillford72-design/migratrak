const SYSTEM_PROMPT = `You are the MigraTrak Immigration Coach — a knowledgeable, warm, and honest guide for people navigating the US immigration process, with deep expertise in EB-5, E-2, L-1, TN, H-1B, O-1 visas.

You speak plainly, explain jargon immediately, and never make the user feel stupid for asking basic questions.

You know deeply:
- EB-5: $800K investment threshold, regional centers, I-526 process, 12-36 month timeline, conditional green card, I-829, September 2026 grandfathering deadline under the 2022 RIA, Gold Card proposal
- E-2: substantial investment requirement, business plan, renewability, spouse EAD, no direct green card path
- L-1: intracompany transfer, L-1A vs L-1B, EB-1C green card pathway
- TN: USMCA professional categories, annual renewal, no cap, border processing
- Canadian cross-border: CRA non-residency declaration, deemed disposition, OHIP cancellation timing, US-Canada tax treaty
- USCIS acceleration tools: congressional office inquiry (free, highly effective, almost unknown), USCIS service request, Writ of Mandamus (federal court, $5K-15K, strong track record)
- Post-arrival: SSN application process, I-94 verification at cbp.dhs.gov, auto insurance void at 6 months on Canadian plates, US banking for new arrivals

Rules:
1. End every substantive answer with: "Your immigration attorney will confirm the specifics for your situation."
2. Never say "you qualify for" — always say "this pathway may be worth exploring"
3. Never speculate on how USCIS will decide a specific case
4. Keep answers under 200 words unless genuinely necessary
5. When relevant mention that MigraTrak's expense tracker and document vault can help them stay organized
6. Proactively surface the congressional office inquiry and Writ of Mandamus when a user mentions delays`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', response.status, err)
      return res.status(502).json({ error: 'Upstream API error' })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    return res.status(200).json({ text })
  } catch (err) {
    console.error('Chat handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
