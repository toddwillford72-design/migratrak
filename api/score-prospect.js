// Scoring weights: budget fit 30, pathway fit 25, completeness 20, timeline realism 15, no flags 10

const SUPABASE_URL     = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Investment minimums per visa type (matches src/data/config.js)
const VISA_INVESTMENT = {
  eb5:    { required: true,  min: 800000 },
  e2:     { required: true,  min: 100000 },
  tn:     { required: false, min: 0 },
  l1:     { required: false, min: 0 },
  h1b:    { required: false, min: 0 },
  o1:     { required: false, min: 0 },
  k1:     { required: false, min: 0 },
  eb2niw: { required: false, min: 0 },
}

const BUDGET_VALUES = {
  'Under $100,000':          50000,
  '$100,000 to $300,000':    200000,
  '$300,000 to $800,000':    550000,
  'Over $800,000':           900000,
  'Not sure yet':            0,
}

// ── Component scorers ─────────────────────────────────────────────────────────

function scoreBudget(budgetRange, visaType) {
  const visa = VISA_INVESTMENT[visaType]
  if (!visa) return 15

  if (!visa.required) return 30

  const value = BUDGET_VALUES[budgetRange] ?? 0
  if (value === 0) return 8                                 // unknown budget vs required investment
  if (value >= visa.min * 1.1) return 30                   // comfortably above minimum
  if (value >= visa.min) return 22                          // meets minimum
  if (value >= visa.min * 0.5) return 12                   // within striking range
  return 4                                                  // well below — significant gap
}

function scorePathway(answers, visaType) {
  const { motivation, budget, professional_background } = answers

  const isBusiness      = motivation === 'Buying or starting a business'
  const isTransfer      = motivation === 'My employer is transferring me'
  const isFamily        = motivation === 'Family reasons'
  const hasUsmca        = (professional_background || '').includes('USMCA')
  const hasAchievements = (professional_background || '').includes('notable achievements')
  const hasJobOffer     = (professional_background || '').includes('job offer')
  const highBudget      = budget === 'Over $800,000'
  const sufficientE2    = ['$100,000 to $300,000', '$300,000 to $800,000', 'Over $800,000'].includes(budget)

  switch (visaType) {
    case 'eb5':
      if (isBusiness && highBudget) return 25
      if (isBusiness) return 14
      return 4
    case 'e2':
      if (isBusiness && sufficientE2) return 25
      if (isBusiness) return 14
      return 4
    case 'tn':
      if (hasUsmca) return 25
      if (isTransfer || hasJobOffer) return 15
      return 6
    case 'l1':
      if (isTransfer) return 25
      return 8
    case 'h1b':
      if (isTransfer || hasJobOffer) return 22
      return 7
    case 'o1':
      if (hasAchievements) return 25
      return 8
    case 'k1':
      if (isFamily) return 25
      return 8
    case 'eb2niw':
      if (hasAchievements || hasUsmca) return 22
      return 10
    default:
      return 12
  }
}

function scoreCompleteness(answers, visaType, destinationState) {
  const fields = [
    answers.country,
    answers.motivation,
    answers.household,
    answers.budget,
    visaType,
    destinationState,
  ]
  const filled = fields.filter(f => f && f !== 'Not sure yet' && f !== 'Not sure').length
  return Math.round((filled / fields.length) * 20)
}

function scoreTimeline(answers, visaType) {
  const { motivation, fund_readiness, professional_background } = answers
  const isTransfer = motivation === 'My employer is transferring me'
  const hasJobOffer = (professional_background || '').includes('job offer')

  if (visaType === 'eb5' || visaType === 'e2') {
    const map = {
      'Accessible now — funds are liquid and in hand': 15,
      'Mostly accessible — would take some time (e.g., selling property, RRSP withdrawal)': 10,
      'Not yet — I would need to arrange financing or sell major assets first': 4,
      'Not sure': 5,
    }
    return map[fund_readiness] ?? 7
  }

  if (visaType === 'tn' || visaType === 'l1' || visaType === 'h1b') {
    if (isTransfer) return 15
    if (hasJobOffer) return 12
    return 6
  }

  return 10 // neutral for visa types where timeline is less ambiguous
}

function scoreFlags(answers, visaType) {
  let points = 10
  const { motivation, budget } = answers
  const visa = VISA_INVESTMENT[visaType]

  // Budget clearly insufficient for investment visa
  if (visa?.required) {
    const value = BUDGET_VALUES[budget] ?? 0
    if (value > 0 && value < visa.min * 0.5) points -= 5
  }

  // Motivation completely misaligned with visa type
  const investorVisas = ['eb5', 'e2']
  const professionalVisas = ['tn', 'l1', 'h1b', 'o1', 'eb2niw']
  const familyVisas = ['k1']

  if (investorVisas.includes(visaType) && motivation === 'Family reasons') points -= 4
  if (familyVisas.includes(visaType) && motivation === 'Buying or starting a business') points -= 4
  if (professionalVisas.includes(visaType) && motivation === 'Buying or starting a business') points -= 3

  // H-1B lottery dependency is always a structural flag
  if (visaType === 'h1b') points -= 2

  return Math.max(0, points)
}

function deriveComplexity(answers, visaType) {
  const { household, num_children, children } = answers
  const hasSpouse   = household?.includes('spouse') || household?.includes('partner')
  const childCount  = parseInt(num_children) || (children?.startsWith('Yes') ? 1 : 0)
  const familyTotal = 1 + (hasSpouse ? 1 : 0) + childCount

  const highComplexityVisas   = ['eb5', 'eb2niw']
  const mediumComplexityVisas = ['e2', 'l1', 'h1b', 'o1', 'k1']

  if (familyTotal >= 4 || highComplexityVisas.includes(visaType)) return 'High'
  if (familyTotal >= 3 || mediumComplexityVisas.includes(visaType)) return 'Medium'
  return 'Low'
}

function deriveFamilySize(answers) {
  const { household, num_children, children } = answers
  const hasSpouse  = household?.includes('spouse') || household?.includes('partner')
  const childCount = parseInt(num_children) || (children?.startsWith('Yes') ? 1 : 0)
  return 1 + (hasSpouse ? 1 : 0) + childCount
}

function hasAgeOutRisk(answers) {
  return answers.children === 'Yes — aged 18, 19, or 20'
}

// ── Anthropic note + intro email generation ──────────────────────────────────

async function generateIntroEmail(prospectName, visaType, score, fitRating, answers, attorneyName, attorneyFirm) {
  if (!ANTHROPIC_API_KEY) return null
  const budgetStr  = answers.budget || 'undisclosed'
  const motivation = answers.motivation || 'not specified'
  const firstName  = prospectName.split(' ')[0] || prospectName

  const prompt = `Write a short professional email from ${prospectName} to immigration attorney ${attorneyName}${attorneyFirm ? ` at ${attorneyFirm}` : ''} requesting a consultation.

Context:
- Visa goal: ${(visaType || 'US immigration').toUpperCase()}
- Readiness score: ${score}/100 (${fitRating} fit)
- Budget context: ${budgetStr}
- Situation: ${motivation}
- Found attorney via MigraTrak (beta immigration planning tool)

Format exactly: first line "Subject: [subject line]", blank line, then 3 sentences of body, signed with just "${firstName}". Warm but professional. Mention MigraTrak once. No legal advice.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 250, messages: [{ role: 'user', content: prompt }] }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = data.content?.[0]?.text?.trim() || ''
    const lines = text.split('\n')
    const subjectIdx = lines.findIndex(l => l.toLowerCase().startsWith('subject:'))
    const subject = subjectIdx >= 0
      ? lines[subjectIdx].replace(/^subject:\s*/i, '').trim()
      : `Consultation Request — ${(visaType || 'Immigration').toUpperCase()}`
    const body = lines.slice(subjectIdx + 1).join('\n').trim()
    return { subject, body }
  } catch {
    return null
  }
}

async function generateConsultationNote(name, visaType, score, fitRating, answers) {
  const fallback = `${name} is pursuing a ${visaType?.toUpperCase() || 'visa'} — readiness score ${score}/100 (${fitRating}).`
  if (!ANTHROPIC_API_KEY) return fallback

  const budgetStr  = answers.budget || 'undisclosed'
  const motivation = answers.motivation || 'not specified'

  const prompt = `Write exactly one sentence (max 20 words) summarizing this immigration prospect for an attorney's review.
Prospect: ${name}
Visa: ${visaType?.toUpperCase()}
Readiness score: ${score}/100 (${fitRating})
Budget: ${budgetStr}
Motivation: ${motivation}
One sentence only. Professional, factual tone. No legal advice.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 80,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) return fallback
    const data = await res.json()
    return data.content?.[0]?.text?.trim() || fallback
  } catch {
    return fallback
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!SUPABASE_URL)     return res.status(500).json({ error: 'Database not configured' })
  if (!SUPABASE_SERVICE) return res.status(500).json({ error: 'Database credentials not configured' })

  const {
    name,
    email,
    visa_type,
    budget_range,
    destination_state,
    assessment_answers,
    attorney_id,
    professional_name,
  } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' })
  }

  const answers = assessment_answers || {}

  // Use budget_range from either top-level field or assessment answers
  const effectiveBudget = budget_range || answers.budget || null

  // ── Score calculation ──────────────────────────────────────────────────────
  const budgetScore      = scoreBudget(effectiveBudget, visa_type)
  const pathwayScore     = scorePathway(answers, visa_type)
  const completenessScore = scoreCompleteness(answers, visa_type, destination_state)
  const timelineScore    = scoreTimeline(answers, visa_type)
  const flagsScore       = scoreFlags(answers, visa_type)

  const totalScore = budgetScore + pathwayScore + completenessScore + timelineScore + flagsScore

  const fitRating = totalScore >= 75 ? 'Strong' : totalScore >= 50 ? 'Possible' : 'Unlikely'
  const complexity = deriveComplexity(answers, visa_type)
  const familySize = deriveFamilySize(answers)
  const ageOutRisk = hasAgeOutRisk(answers)

  // ── AI consultation note + intro email (parallel) ─────────────────────────
  const attorneyDisplayName = professional_name || null
  const [aiNote, introEmail] = await Promise.all([
    generateConsultationNote(name, visa_type, totalScore, fitRating, answers),
    attorneyDisplayName
      ? generateIntroEmail(name, visa_type, totalScore, fitRating, answers, attorneyDisplayName, null)
      : Promise.resolve(null),
  ])

  // ── Insert prospect row ────────────────────────────────────────────────────
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE,
    'Authorization': `Bearer ${SUPABASE_SERVICE}`,
    'Prefer': 'return=representation',
  }

  const prospectRow = {
    name,
    email,
    visa_type:             visa_type || null,
    budget_range:          effectiveBudget || null,
    destination_state:     destination_state || null,
    family_size:           familySize,
    dependent_ages:        ageOutRisk ? '18-20' : (answers.children || null),
    score:                 totalScore,
    fit_rating:            fitRating,
    complexity,
    ai_consultation_note:  aiNote,
    assessment_answers:    answers,
    attorney_id:           attorney_id || null,
    status:                'pending',
    age_out_risk:          ageOutRisk,
    score_breakdown: {
      budget:       budgetScore,
      pathway:      pathwayScore,
      completeness: completenessScore,
      timeline:     timelineScore,
      flags:        flagsScore,
    },
  }

  try {
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/prospects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(prospectRow),
    })

    if (!insertRes.ok) {
      const body = await insertRes.text()
      console.error('[score-prospect] Supabase insert failed:', body)
      console.error('[score-prospect] prospectRow keys:', Object.keys(prospectRow))
      return res.status(500).json({ error: `Failed to create prospect: ${body}` })
    }

    const [prospect] = await insertRes.json()
    return res.status(201).json({ success: true, prospect, intro_email: introEmail })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to create prospect' })
  }
}
