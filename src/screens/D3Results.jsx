import { useNavigate, useLocation } from 'react-router-dom'
import { VISA_TYPES } from '../data/config'

// ── Visa display metadata (supplements config.js data) ──────────────────────
const VISA_DISPLAY = {
  e2: {
    investmentRange: '$100,000 to $500,000 typical',
    timeline: '4 to 8 months',
    greenCardLabel: 'Not directly',
    greenCardNote: 'Does not by itself lead to citizenship',
    renewableLabel: 'Yes, indefinitely',
    ctaLabel: 'Talk to an E-2 specialist',
    bestFit: true,
  },
  eb5: {
    investmentRange: '$800,000 minimum',
    timeline: '12 to 36 months',
    greenCardLabel: 'YES — this IS the green card',
    greenCardNote: 'Higher investment, longer wait',
    renewableLabel: 'N/A — leads to permanent residence',
    ctaLabel: 'Talk to an EB-5 specialist',
    bestFit: false,
  },
  tn: {
    investmentRange: 'None required',
    timeline: 'Can be same day at the border',
    greenCardLabel: 'Not directly',
    greenCardNote: 'Work authorization only; employer-dependent',
    renewableLabel: 'Yes, annually',
    ctaLabel: 'Check if I qualify',
    bestFit: false,
  },
  l1: {
    investmentRange: 'None required',
    timeline: '2 to 4 months',
    greenCardLabel: 'Yes — via EB-1C petition',
    greenCardNote: 'Requires qualifying intracompany transfer',
    renewableLabel: 'Up to 7 years (L-1A)',
    ctaLabel: 'Check if I qualify',
    bestFit: false,
  },
  h1b: {
    investmentRange: 'None required',
    timeline: '3 to 6 months (lottery April)',
    greenCardLabel: 'Yes — employer-sponsored',
    greenCardNote: 'Subject to annual cap lottery',
    renewableLabel: 'Up to 6 years',
    ctaLabel: 'Check if I qualify',
    bestFit: false,
  },
  o1: {
    investmentRange: 'None required',
    timeline: '2 to 4 months',
    greenCardLabel: 'Yes — via EB-1A',
    greenCardNote: 'Requires proof of extraordinary ability',
    renewableLabel: 'Yes, in 1-year increments',
    ctaLabel: 'Check if I qualify',
    bestFit: false,
  },
  k1: {
    investmentRange: 'None required',
    timeline: '6 to 9 months',
    greenCardLabel: 'Yes — after marriage',
    greenCardNote: 'Must marry within 90 days of entry',
    renewableLabel: 'Single entry',
    ctaLabel: 'Check if I qualify',
    bestFit: false,
  },
  eb2niw: {
    investmentRange: 'None required',
    timeline: '12 to 48 months',
    greenCardLabel: 'YES — this IS the green card',
    greenCardNote: 'Self-petition; no employer required',
    renewableLabel: 'N/A — leads to permanent residence',
    ctaLabel: 'Check if I qualify',
    bestFit: false,
  },
}

// ── Logic: pick 2–3 visa IDs based on Q2 motivation + Q5 budget ─────────────
function selectVisas(motivation, budget) {
  const highBudget = budget === 'Over $800,000'
  const midBudget =
    budget === '$300,000 to $800,000' || budget === '$100,000 to $300,000'
  const lowBudget = budget === 'Under $100,000'
  const unsure = budget === 'Not sure yet'

  if (motivation === 'Buying or starting a business') {
    if (highBudget) return ['eb5', 'e2', 'tn']
    if (midBudget) return ['e2', 'eb5', 'tn']
    return ['e2', 'tn', 'l1']
  }
  if (motivation === 'My employer is transferring me') {
    return ['l1', 'tn', 'h1b']
  }
  if (motivation === 'Family reasons') {
    return ['k1', 'eb2niw', 'tn']
  }
  if (motivation === 'Lifestyle — I want a fresh start') {
    if (highBudget || midBudget) return ['eb5', 'e2', 'eb2niw']
    return ['eb2niw', 'o1', 'tn']
  }
  // Not sure yet / fallback
  if (highBudget) return ['eb5', 'e2', 'tn']
  if (midBudget || unsure || lowBudget) return ['e2', 'tn', 'eb2niw']
  return ['e2', 'tn', 'eb2niw']
}

// ── Sub-components ────────────────────────────────────────────────────────────
function AgeOutBanner({ onFindAttorney }) {
  return (
    <div style={{ backgroundColor: '#DC2626' }} className="w-full px-4 py-4">
      <div className="flex gap-2 items-start mb-2">
        <span className="text-lg leading-none mt-0.5">⚠️</span>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide" style={{ color: '#FFFFFF' }}>
            Time-Sensitive: Age-Out Risk
          </p>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: '#FEE2E2' }}>
            Your child may lose dependent status when they turn 21. This can affect your entire family's visa application. You may have less time than you think. Speak to an immigration attorney this week — not next month.
          </p>
        </div>
      </div>
      <button
        onClick={onFindAttorney}
        className="mt-2 w-full py-2.5 rounded-xl text-sm font-bold transition-opacity active:opacity-80"
        style={{ backgroundColor: '#FFFFFF', color: '#DC2626' }}
      >
        Find an attorney now →
      </button>
    </div>
  )
}

function DetailRow({ label, value, valueStyle }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: '1px solid #EBF4FB' }}>
      <span className="text-xs font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: '#4A5568' }}>
        {label}
      </span>
      <span className="text-xs text-right font-medium" style={{ color: '#0D2B4E', ...valueStyle }}>
        {value}
      </span>
    </div>
  )
}

function VisaCard({ visaId, onCta }) {
  const visa = VISA_TYPES.find((v) => v.id === visaId)
  const display = VISA_DISPLAY[visaId]
  if (!visa || !display) return null

  const isGreenCard = visa.greenCardPath

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{ backgroundColor: '#FFFFFF', border: display.bestFit ? '2px solid #1B5FA8' : '2px solid #E2E8F0' }}
    >
      {/* Card header */}
      <div
        className="px-5 py-4"
        style={{ backgroundColor: display.bestFit ? '#0D2B4E' : '#F7F9FC' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span
              className="text-xl font-extrabold"
              style={{ color: display.bestFit ? '#FFFFFF' : '#0D2B4E' }}
            >
              {visa.name}
            </span>
            <p
              className="text-xs mt-0.5"
              style={{ color: display.bestFit ? '#4A9FD4' : '#4A5568' }}
            >
              {visa.fullName}
            </p>
          </div>
          {display.bestFit && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
            >
              Best Fit
            </span>
          )}
          {isGreenCard && !display.bestFit && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#D1FAE5', color: '#1A7A4A' }}
            >
              Green Card
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 pt-1 pb-4">
        <p className="text-xs leading-relaxed py-3" style={{ color: '#4A5568' }}>
          This pathway may be worth exploring with an immigration attorney.
        </p>

        <DetailRow label="Investment" value={display.investmentRange} />
        <DetailRow label="Timeline" value={display.timeline} />
        <DetailRow
          label="Green Card"
          value={display.greenCardLabel}
          valueStyle={isGreenCard ? { color: '#1A7A4A', fontWeight: '700' } : {}}
        />
        <DetailRow label="Renewable" value={display.renewableLabel} />

        {display.greenCardNote && (
          <p className="text-xs mt-2 italic" style={{ color: '#A0AEC0' }}>
            {display.greenCardNote}
          </p>
        )}

        <button
          onClick={() => onCta(visaId)}
          className="mt-4 w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: display.bestFit ? '#F0A500' : '#EBF4FB', color: display.bestFit ? '#0D2B4E' : '#1B5FA8' }}
        >
          {display.ctaLabel} →
        </button>
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function D3Results() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const answers = state?.answers ?? {}

  const hasAgeAlert = answers.children === 'Yes — aged 18, 19, or 20'
  const visaIds = selectVisas(answers.motivation, answers.budget)

  function goToJ5() {
    navigate('/j5', { state: { filter: 'attorneys' } })
  }

  function handleVisaCta() {
    navigate('/j5')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Age-out alert — always first if triggered */}
      {hasAgeAlert && <AgeOutBanner onFindAttorney={goToJ5} />}

      {/* Page header */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          Your Results
        </p>
        <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>
          Visa Pathways to Explore
        </h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: '#4A5568' }}>
          Based on your answers — review these options with a licensed immigration attorney before making any decisions.
        </p>
      </div>

      {/* Visa cards */}
      <div className="flex flex-col gap-4 px-4 pt-3 pb-4">
        {visaIds.map((id) => (
          <VisaCard key={id} visaId={id} onCta={handleVisaCta} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div
        className="mx-4 mb-6 rounded-2xl px-5 py-5 flex flex-col gap-3"
        style={{ backgroundColor: '#0D2B4E' }}
      >
        <p className="text-sm font-bold leading-snug" style={{ color: '#FFFFFF' }}>
          Not sure which path is right for you?
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#4A9FD4' }}>
          A 30-minute consultation clarifies everything — costs, timelines, and which visa actually fits your situation.
        </p>
        <button
          onClick={goToJ5}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
        >
          Speak with an immigration specialist — find one near you →
        </button>
      </div>

    </div>
  )
}
