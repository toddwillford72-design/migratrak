const EXTRACT_PROMPT = `Extract the total amount, vendor name, and date from this receipt. Return JSON only with keys: amount (number, no currency symbol), vendor (string), date (YYYY-MM-DD format). If you cannot determine a value return null for that key.`

const EMPTY_RESULT = { amount: null, vendor: null, date: null }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(EMPTY_RESULT)
  }

  try {
    const { receiptUrl } = req.body
    if (!receiptUrl) {
      return res.status(200).json(EMPTY_RESULT)
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(200).json(EMPTY_RESULT)
    }

    const imageRes = await fetch(receiptUrl)
    if (!imageRes.ok) {
      return res.status(200).json(EMPTY_RESULT)
    }
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg'
    const buffer = await imageRes.arrayBuffer()
    const base64Data = Buffer.from(buffer).toString('base64')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: contentType, data: base64Data } },
            { type: 'text', text: EXTRACT_PROMPT },
          ],
        }],
      }),
    })

    if (!response.ok) {
      return res.status(200).json(EMPTY_RESULT)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(200).json(EMPTY_RESULT)
    }

    const parsed = JSON.parse(jsonMatch[0])
    return res.status(200).json({
      amount: typeof parsed.amount === 'number' ? parsed.amount : null,
      vendor: typeof parsed.vendor === 'string' ? parsed.vendor : null,
      date:   typeof parsed.date === 'string' ? parsed.date : null,
    })
  } catch (err) {
    console.error('extract-receipt error:', err)
    return res.status(200).json(EMPTY_RESULT)
  }
}
