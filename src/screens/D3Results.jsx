import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NavFooter from '../components/NavFooter'

// ── Personalization logic ─────────────────────────────────────────────────────

function isCanada(answers) {
  return answers.country === 'Canada'
}

function isBusiness(answers) {
  return answers.motivation === 'Buying or starting a business'
}

function isEmployerTransfer(answers) {
  return answers.motivation === 'My employer is transferring me'
}

function isLifestyleOrFamily(answers) {
  return (
    answers.motivation === 'Lifestyle — I want a fresh start' ||
    answers.motivation === 'Family reasons'
  )
}

function isNotSure(answers) {
  return answers.motivation === 'Not sure yet'
}

function hasAgeOutRisk(answers) {
  return answers.children === 'Yes — aged 18, 19, or 20'
}

function hasFamilyChildren(answers) {
  return (
    answers.household === 'Me, spouse, and children' ||
    answers.children?.startsWith('Yes')
  )
}

function budgetLabel(answers) {
  const map = {
    'Under $100,000': 'under $100,000',
    '$100,000 to $300,000': '$100,000 to $300,000',
    '$300,000 to $800,000': '$300,000 to $800,000',
    'Over $800,000': 'over $800,000',
    'Not sure yet': 'undecided',
  }
  return map[answers.budget] || answers.budget || 'undecided'
}

// Returns array of card config objects in display order
function buildCards(answers) {
  const canada = isCanada(answers)
  const budget = answers.budget
  const children = hasFamilyChildren(answers)

  const dependentNote = children
    ? 'Dependent family members add processing steps and fees to each stage.'
    : null

  const e2Card = {
    id: 'e2',
    title: 'E-2 Investor Visa',
    lead: false,
    opener: canada && isBusiness(answers)
      ? `As a Canadian citizen with a business motivation and a ${budgetLabel(answers)} budget, the E-2 is typically the first visa attorneys explore in your situation.`
      : 'This pathway may be worth exploring with an immigration attorney based on your profile.',
    budgetWarning:
      budget === 'Under $100,000'
        ? 'Your stated budget is below the typical E-2 investment range. An attorney can advise on whether structuring options exist.'
        : null,
    whatItIs:
      'Invest in or buy a US business and live and work here while you operate it.',
    investment: '$100,000 – $500,000 typical',
    timeline: '4–8 months',
    greenCard: 'Not directly — requires a separate petition later',
    greenCardPath: false,
    renewable: 'Yes, indefinitely while business operates',
    rightFor:
      'You want to buy or start a business and be actively involved in running it',
    warning: 'Does not by itself lead to permanent residency or citizenship',
    dependentNote,
    expandLabel: 'Learn more about E-2',
    ctaLabel: 'Speak with an E-2 specialist',
    expandContent: [
      'The E-2 requires you to invest a "substantial" amount in a US business — USCIS does not specify a minimum, but $100,000–$500,000 is typical in practice.',
      'You must own at least 50% of the business and be actively managing it.',
      'Canada is a treaty country, meaning Canadians are eligible. Not all nationalities qualify.',
      'The E-2 is renewable indefinitely as long as the business continues to operate — but it does not create a direct path to a green card.',
    ],
  }

  const eb5Card = {
    id: 'eb5',
    title: 'EB-5 Investor Green Card',
    lead: false,
    opener:
      budget === 'Over $800,000'
        ? 'With your investment budget and long-term residency goal, the EB-5 is worth exploring as your primary pathway.'
        : 'If permanent US residency is your ultimate goal, the EB-5 is worth understanding — though your current budget may require planning for the investment threshold.',
    whatItIs:
      'Invest in a qualifying US project or business and receive a green card.',
    investment: '$800,000 minimum (USCIS 2024)',
    timeline: '12–36 months (processing times vary)',
    greenCard: 'YES — this IS the green card',
    greenCardPath: true,
    renewable: 'N/A — leads to permanent residence',
    rightFor:
      'Long-term US residency and a pathway to citizenship is your ultimate goal',
    warning:
      'Higher investment threshold and longer wait — but leads directly to permanent residency. Processing times have improved significantly since 2023.',
    dependentNote,
    expandLabel: 'Learn more about EB-5',
    ctaLabel: 'Speak with an EB-5 specialist',
    expandContent: [
      'The $800,000 threshold applies to investments in Targeted Employment Areas (TEA). Non-TEA investments require $1,050,000.',
      'The investment must create at least 10 full-time US jobs.',
      'Regional center investments are passive — you do not need to manage the business.',
      'Your investment is held in the project, not spent as a fee. It is at-risk capital.',
      'After 2 years of conditional residency, you file to remove conditions and receive a permanent green card.',
    ],
  }

  const tnCard = {
    id: 'tn',
    title: 'TN Visa — USMCA Professional',
    lead: false,
    opener:
      'As a Canadian citizen, you have access to the TN visa — one of the fastest and simplest US work authorization options available.',
    whatItIs:
      'Work authorization for Canadian professionals in specific qualifying occupations under the USMCA trade agreement.',
    investment: 'None',
    timeline: 'Can be approved same day at the border',
    greenCard: 'Not directly',
    greenCardPath: false,
    renewable: 'Yes, annually (no maximum period)',
    rightFor:
      'You work in a qualifying profession and have a US employer offering you a position',
    warning:
      'Only available to Canadian and Mexican citizens. Requires a job offer from a US employer in a qualifying occupation. Does not lead to permanent residency.',
    dependentNote,
    expandLabel: 'Check qualifying occupations',
    ctaLabel: 'Speak with a TN specialist',
    expandContent: [
      'TN qualifying occupations include: accountants, engineers, lawyers, pharmacists, scientists, teachers, and many more — over 60 categories.',
      'You apply at the port of entry (land border or airport) or via DS-160 at a US consulate.',
      'There is no annual cap or lottery — unlike the H-1B.',
      'Each TN admission is granted for up to 3 years, renewable indefinitely.',
      'Spouses and children enter on TD visas but are not authorized to work.',
    ],
  }

  const l1Card = {
    id: 'l1',
    title: 'L-1 Intracompany Transfer Visa',
    lead: false,
    opener:
      "You're being transferred by your employer — the L-1 is almost certainly your pathway. Your company's immigration counsel will typically manage this process.",
    whatItIs:
      'Allows multinational companies to transfer employees from a foreign office to a US office.',
    investment: 'None — employer sponsored',
    timeline: '2–4 months standard; 15 business days with premium processing',
    greenCard: 'Yes — L-1A (managers) can lead to EB-1C green card',
    greenCardPath: true,
    renewable: 'Up to 7 years (L-1A managers); up to 5 years (L-1B specialists)',
    rightFor:
      "You've worked for your employer for at least 1 year and are being transferred to a US office",
    warning:
      "Tied to your employer — if you leave the company your status is affected. Confirm details with your employer's immigration counsel.",
    dependentNote,
    expandLabel: 'Learn more about L-1',
    ctaLabel: 'Speak with an L-1 specialist',
    expandContent: [
      'L-1A is for managers and executives; L-1B is for employees with specialized knowledge.',
      'You must have worked for the company for at least 1 continuous year within the past 3 years.',
      'L-1A holders can pursue the EB-1C green card (multinational manager/executive) — often faster than EB-2 or EB-3.',
      'Your employer files the petition — you do not file individually.',
      'Premium processing (15 business days) is available for an additional $2,805 fee.',
    ],
  }

  // Build ordered list based on rules
  if (isEmployerTransfer(answers)) {
    const cards = [{ ...l1Card, lead: true }]
    if (canada) cards.push(tnCard)
    return cards
  }

  if (isLifestyleOrFamily(answers) || isNotSure(answers)) {
    // All cards, no lead badge
    const cards = [e2Card, eb5Card]
    if (canada) cards.push(tnCard)
    return cards
  }

  // Business motivation
  if (isBusiness(answers)) {
    if (budget === 'Over $800,000') {
      const cards = [{ ...eb5Card, lead: true }, e2Card]
      if (canada) cards.push(tnCard)
      return cards
    }
    if (budget === '$300,000 to $800,000') {
      const cards = [{ ...e2Card, lead: true }, eb5Card]
      if (canada) cards.push(tnCard)
      return cards
    }
    // Under $100K or $100K-$300K
    const cards = [{ ...e2Card, lead: true }]
    if (canada) cards.push(tnCard)
    return cards
  }

  // Fallback
  const cards = [e2Card, eb5Card]
  if (canada) cards.push(tnCard)
  return cards
}

function buildHeader(answers) {
  if (isEmployerTransfer(answers)) {
    return 'Based on your answers — employer-sponsored move — the L-1 visa is likely your primary pathway. Your employer\'s immigration counsel will typically lead this process.'
  }
  if (isLifestyleOrFamily(answers)) {
    return 'Your situation doesn\'t fit a single obvious visa category — which is actually common. The right path depends on factors an attorney will uncover in a 30-minute consultation. Here\'s a general overview of the most common options for your profile.'
  }
  if (isNotSure(answers)) {
    return 'No problem — most people aren\'t sure at this stage. Here\'s an overview of the main pathways so you can go into an attorney consultation already informed.'
  }
  if (isBusiness(answers) && isCanada(answers)) {
    return `Based on your answers — Canadian citizen, business motivation, ${budgetLabel(answers)} budget — here are your most likely pathways. These are starting points for a conversation with an attorney, not a final determination.`
  }
  return 'Based on your answers, here are your most likely visa pathways. These are starting points for a conversation with an attorney, not a final determination.'
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function AgeOutBanner({ onFindAttorney }) {
  return (
    <div style={{ backgroundColor: '#DC2626' }} className="w-full px-4 pt-4 pb-3">
      <div className="flex gap-2 items-start mb-3">
        <span className="text-xl leading-none mt-0.5">🚨</span>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide mb-1" style={{ color: '#FFFFFF' }}>
            Time-Sensitive: Age-Out Risk
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#FEE2E2' }}>
            Based on your answers, you have a dependent child approaching 21. They could lose eligibility as a dependent on your application when they turn 21 — regardless of where you are in the process. This affects your entire family's timeline.
          </p>
          <p className="text-sm font-semibold mt-2" style={{ color: '#FFFFFF' }}>
            Speak to an immigration attorney this week — not next month.
          </p>
        </div>
      </div>
      <button
        onClick={onFindAttorney}
        className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity active:opacity-80"
        style={{ backgroundColor: '#FFFFFF', color: '#DC2626' }}
      >
        Find an attorney now →
      </button>
    </div>
  )
}

function LifestyleInfoBox() {
  return (
    <div
      className="mx-4 mb-2 rounded-2xl px-4 py-4"
      style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}
    >
      <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
        Your move is lifestyle or family motivated — which means your visa pathway depends heavily on factors like your profession, whether you have a US employer, your investment capacity, and your long-term residency goals.
      </p>
      <p className="text-sm leading-relaxed mt-2" style={{ color: '#4A5568' }}>
        The options below are the most common pathways for people in your situation. A 30-minute consultation with an immigration attorney will clarify which applies to you — most offer this at no charge.
      </p>
    </div>
  )
}

function DetailRow({ label, value, highlight }) {
  return (
    <div
      className="flex items-start justify-between gap-3 py-2"
      style={{ borderBottom: '1px solid #F1F5F9' }}
    >
      <span className="text-xs font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: '#4A5568' }}>
        {label}
      </span>
      <span
        className="text-xs text-right font-semibold"
        style={{ color: highlight ? '#1A7A4A' : '#0D2B4E' }}
      >
        {value}
      </span>
    </div>
  )
}

function VisaCard({ card, onCta }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{
        backgroundColor: '#FFFFFF',
        border: card.lead ? '2px solid #1B5FA8' : '2px solid #E2E8F0',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ backgroundColor: card.lead ? '#0D2B4E' : '#F7F9FC' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className="text-lg font-extrabold leading-tight"
              style={{ color: card.lead ? '#FFFFFF' : '#0D2B4E' }}
            >
              {card.title}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {card.lead && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap"
                style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
              >
                Most likely fit
              </span>
            )}
            {card.greenCardPath && !card.lead && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ backgroundColor: '#D1FAE5', color: '#1A7A4A' }}
              >
                Green Card
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-3 pb-4 flex flex-col gap-3">
        {/* Personalized opener */}
        <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>
          {card.opener}
        </p>

        {/* Budget warning */}
        {card.budgetWarning && (
          <div
            className="px-3 py-2 rounded-lg"
            style={{ backgroundColor: '#FEF3C7', border: '1px solid #F0A500' }}
          >
            <p className="text-xs font-semibold" style={{ color: '#92400E' }}>
              ⚠️ {card.budgetWarning}
            </p>
          </div>
        )}

        {/* What it is */}
        <div
          className="px-3 py-2 rounded-lg"
          style={{ backgroundColor: '#F7F9FC' }}
        >
          <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: '#4A5568' }}>
            What it is
          </p>
          <p className="text-sm" style={{ color: '#0D2B4E' }}>
            {card.whatItIs}
          </p>
        </div>

        {/* Detail rows */}
        <div>
          <DetailRow label="Investment" value={card.investment} />
          <DetailRow label="Timeline" value={card.timeline} />
          <DetailRow
            label="Green Card"
            value={card.greenCard}
            highlight={card.greenCardPath}
          />
          <DetailRow label="Renewable" value={card.renewable} />
        </div>

        {/* Right for you if */}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: '#4A5568' }}>
            Right for you if
          </p>
          <p className="text-sm" style={{ color: '#0D2B4E' }}>
            {card.rightFor}
          </p>
        </div>

        {/* Dependent note */}
        {card.dependentNote && (
          <p className="text-xs italic" style={{ color: '#4A9FD4' }}>
            {card.dependentNote}
          </p>
        )}

        {/* Warning */}
        <div
          className="px-3 py-2 rounded-lg flex gap-2"
          style={{ backgroundColor: '#FEF3C7' }}
        >
          <span className="text-sm flex-shrink-0">⚠️</span>
          <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
            {card.warning}
          </p>
        </div>

        {/* Expandable detail */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-semibold transition-opacity active:opacity-60"
          style={{ color: '#1B5FA8' }}
        >
          <span>{card.expandLabel} →</span>
          <span style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>
            ›
          </span>
        </button>

        {expanded && (
          <div
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{ backgroundColor: '#EBF4FB' }}
          >
            {card.expandContent.map((line, i) => (
              <p key={i} className="text-xs leading-relaxed flex gap-2" style={{ color: '#0D2B4E' }}>
                <span style={{ color: '#4A9FD4', flexShrink: 0 }}>•</span>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => onCta()}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{
            backgroundColor: card.lead ? '#F0A500' : '#EBF4FB',
            color: card.lead ? '#0D2B4E' : '#1B5FA8',
          }}
        >
          {card.ctaLabel} →
        </button>
      </div>
    </div>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function D3Results() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const answers = state?.answers ?? {}

  const ageOut = hasAgeOutRisk(answers)
  const showLifestyleBox = isLifestyleOrFamily(answers)
  const cards = buildCards(answers)
  const headerText = buildHeader(answers)

  function goToJ5() {
    navigate('/j5', { state: { filter: 'attorneys' } })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Age-out banner — always first */}
      {ageOut && <AgeOutBanner onFindAttorney={goToJ5} />}

      {/* Page header */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          Your Results
        </p>
        <h1 className="text-2xl font-extrabold leading-tight mb-2" style={{ color: '#0D2B4E' }}>
          Visa Pathways to Explore
        </h1>
        <div
          className="rounded-xl px-4 py-3"
          style={{ backgroundColor: '#EBF4FB' }}
        >
          <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
            {headerText}
          </p>
        </div>
      </div>

      {/* Lifestyle/family info box */}
      {showLifestyleBox && <LifestyleInfoBox />}

      {/* Visa cards */}
      <div className="flex flex-col gap-4 px-4 pb-4">
        {cards.map((card) => (
          <VisaCard key={card.id} card={card} onCta={goToJ5} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div
        className="mx-4 mb-4 rounded-2xl px-5 py-5 flex flex-col gap-3"
        style={{ backgroundColor: '#0D2B4E' }}
      >
        <p className="text-sm font-bold leading-snug" style={{ color: '#FFFFFF' }}>
          Not sure which path is right for you?
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#4A9FD4' }}>
          A 30-minute consultation with an immigration specialist costs nothing and clarifies everything.
        </p>
        <button
          onClick={goToJ5}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
        >
          Speak with an immigration specialist — find one near you →
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center px-6 mb-28 leading-relaxed" style={{ color: '#A0AEC0' }}>
        MigraTrak provides general information only — not legal advice. Visa eligibility depends on your specific circumstances. Always confirm your pathway with a licensed immigration attorney.
      </p>

      <NavFooter backPath="/d2" nextPath="/d4" nextLabel="See Cost Breakdown →" />
    </div>
  )
}
