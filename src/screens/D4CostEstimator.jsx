import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NavFooter from '../components/NavFooter'

// ── Family size helpers ─────────────────────────────────────────────────────

function getFamilySize(answers) {
  if (!answers) return 1
  const { household, num_children } = answers
  let size = 1
  if (household === 'Me and my spouse or partner' || household === 'Me, spouse, and children') size += 1
  if (household === 'Me, spouse, and children' || household === 'Me and my children (no spouse or partner)') {
    size += num_children === '5 or more' ? 5 : (parseInt(num_children, 10) || 0)
  }
  return size
}

function parseAmount(str) {
  return parseInt(str.replace(/[^0-9]/g, ''), 10)
}

// Returns { primary, note } — primary replaces/keeps item.value, note is an
// optional computed-total line shown when the item is per-person and the
// family has more than one member.
function formatItemValue(value, familySize) {
  // "$X × family size" — e.g. EB-5's I-485, I-765/I-131
  let m = value.match(/^\$([\d,]+) × family size$/)
  if (m) {
    const per = parseAmount(m[1])
    const total = per * familySize
    return {
      primary: `$${total.toLocaleString()}`,
      note: `$${per.toLocaleString()} × ${familySize} ${familySize === 1 ? 'person' : 'people'}`,
    }
  }
  // "$X – $Y per person" — e.g. medical examinations
  m = value.match(/^\$([\d,]+) – \$([\d,]+) per person$/)
  if (m) {
    if (familySize <= 1) return { primary: value, note: null }
    const lo = parseAmount(m[1]) * familySize
    const hi = parseAmount(m[2]) * familySize
    return { primary: value, note: `= $${lo.toLocaleString()} – $${hi.toLocaleString()} for your family of ${familySize}` }
  }
  // "$X per person" — e.g. biometrics, DS-160 fees
  m = value.match(/^\$([\d,]+) per person$/)
  if (m) {
    if (familySize <= 1) return { primary: value, note: null }
    const total = parseAmount(m[1]) * familySize
    return { primary: value, note: `= $${total.toLocaleString()} for your family of ${familySize}` }
  }
  return { primary: value, note: null }
}

// ── Cost data per visa ────────────────────────────────────────────────────────

const VISA_DATA = {
  e2: {
    id: 'e2',
    label: 'E-2',
    title: 'E-2 Investor Visa',
    totalLabel: 'Realistic All-In Range',
    totalNote: 'Excluding your business investment',
    totalRange: '$30,000 – $75,000',
    sections: [
      {
        title: 'Investment Requirement',
        accent: '#1A7A4A',
        accentBg: '#D1FAE5',
        items: [
          {
            label: 'Minimum investment in business',
            value: '$100,000 – $500,000',
            bold: true,
            note: 'Must be substantial relative to total business cost — typically 51%+ of business value. This is capital at risk in the business, not a fee.',
          },
        ],
      },
      {
        title: 'Legal & Professional Fees',
        accent: '#1B5FA8',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Immigration attorney', value: '$5,000 – $15,000' },
          { label: 'Business plan (E-2 compliant)', value: '$2,000 – $5,000' },
          { label: 'Business valuation', value: '$1,500 – $3,500' },
          { label: 'Accountant/CPA (cross-border)', value: '$2,000 – $4,000' },
        ],
      },
      {
        title: 'Government Filing Fees',
        accent: '#4A5568',
        accentBg: '#F7F9FC',
        items: [
          { label: 'DS-160 application (per person)', value: '$205 per person' },
          { label: 'Consular processing fee (per person)', value: '$315 per person' },
          { label: 'USCIS (if change of status)', value: '$1,765' },
        ],
      },
      {
        title: 'Business Acquisition Costs',
        accent: '#F0A500',
        accentBg: '#FFFBEB',
        items: [
          { label: 'Business broker fee (if applicable)', value: '8–12% of sale price' },
          { label: 'Due diligence / legal review', value: '$2,000 – $5,000' },
          { label: 'Lease assignment / transfer', value: '$500 – $2,000' },
        ],
      },
      {
        title: 'Relocation',
        accent: '#4A9FD4',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Moving costs', value: '$5,000 – $15,000' },
          { label: 'Temporary accommodation', value: '$3,000 – $8,000' },
          { label: 'Vehicle import or purchase', value: '$1,500 – $3,500' },
        ],
      },
      {
        title: 'First Year in the US',
        accent: '#9333EA',
        accentBg: '#F5F3FF',
        items: [
          { label: 'Auto insurance (US)', value: '$3,000 – $6,000' },
          { label: 'Healthcare (before coverage)', value: '$8,000 – $18,000' },
        ],
      },
    ],
  },

  eb5: {
    id: 'eb5',
    label: 'EB-5',
    title: 'EB-5 Investor Green Card',
    totalLabel: 'Realistic All-In Range',
    totalNote: 'Excluding the $800,000 investment',
    totalRange: '$85,000 – $175,000',
    sections: [
      {
        title: 'Investment Requirement',
        accent: '#1A7A4A',
        accentBg: '#D1FAE5',
        items: [
          {
            label: 'EB-5 minimum investment',
            value: '$800,000',
            bold: true,
            note: 'Held in a qualifying USCIS-approved project — not spent. Capital is at risk and typically returned after 5–7 years.',
          },
        ],
      },
      {
        title: 'Legal & Professional Fees',
        accent: '#1B5FA8',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Immigration attorney', value: '$20,000 – $35,000' },
          { label: 'Business plan preparation', value: '$3,000 – $8,000' },
          { label: 'Regional center administrative fee', value: '$30,000 – $70,000', note: 'Paid to the regional center / NCE — separate from and on top of your $800K investment. Typically due in full before filing I-526E. Non-refundable.' },
          { label: 'Financial advisor', value: '$2,000 – $5,000' },
          { label: 'Source of funds documentation', value: '$1,000 – $3,000' },
        ],
      },
      {
        title: 'Government Filing Fees',
        accent: '#4A5568',
        accentBg: '#F7F9FC',
        items: [
          { label: 'I-526E petition', value: '$11,160' },
          { label: 'I-485 (per person)', value: '$1,440 × family size' },
          { label: 'I-765 / I-131 (per person)', value: '$1,410 × family size' },
          { label: 'I-829 (remove conditions)', value: '$3,750' },
        ],
      },
      {
        title: 'Medical & Biometrics',
        accent: '#9333EA',
        accentBg: '#F5F3FF',
        items: [
          { label: 'Medical examinations', value: '$500 – $1,200 per person' },
          { label: 'Biometrics fees', value: '$85 per person' },
        ],
      },
      {
        title: 'Relocation',
        accent: '#4A9FD4',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Moving costs', value: '$5,000 – $15,000' },
          { label: 'Temporary accommodation', value: '$3,000 – $8,000' },
          { label: 'Vehicle import', value: '$1,500 – $3,500' },
        ],
      },
      {
        title: 'First Year in the US',
        accent: '#F0A500',
        accentBg: '#FFFBEB',
        items: [
          { label: 'Auto insurance (US)', value: '$3,000 – $6,000' },
          { label: 'Healthcare (before coverage)', value: '$8,000 – $18,000' },
        ],
      },
    ],
  },

  tn: {
    id: 'tn',
    label: 'TN',
    title: 'TN Visa — USMCA Professional',
    totalLabel: 'Realistic All-In Range',
    totalNote: 'Excluding relocation',
    totalRange: '$8,000 – $30,000',
    successNote: 'The TN is one of the most cost-effective US work authorization options available to Canadians — if your profession qualifies.',
    sections: [
      {
        title: 'Legal & Professional Fees',
        accent: '#1B5FA8',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Immigration attorney (recommended)', value: '$1,500 – $4,000' },
          { label: 'TN application preparation', value: '$500 – $1,500' },
        ],
      },
      {
        title: 'Government Filing Fees',
        accent: '#4A5568',
        accentBg: '#F7F9FC',
        items: [
          { label: 'TN border application', value: '$50 USD' },
          { label: 'USCIS change of status (if in US)', value: '$370' },
        ],
      },
      {
        title: 'Documentation',
        accent: '#F0A500',
        accentBg: '#FFFBEB',
        items: [
          { label: 'Credential evaluation (if required)', value: '$200 – $400' },
          { label: 'Employer letter preparation', value: '$0 – $500' },
        ],
      },
      {
        title: 'Relocation',
        accent: '#4A9FD4',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Moving costs', value: '$5,000 – $15,000' },
          { label: 'Temporary accommodation', value: '$3,000 – $8,000' },
          { label: 'Vehicle import', value: '$1,500 – $3,500' },
        ],
      },
      {
        title: 'First Year in the US',
        accent: '#9333EA',
        accentBg: '#F5F3FF',
        items: [
          { label: 'Auto insurance (US)', value: '$3,000 – $6,000' },
          { label: 'Healthcare (before coverage)', value: '$8,000 – $18,000' },
        ],
      },
    ],
  },

  l1: {
    id: 'l1',
    label: 'L-1',
    title: 'L-1 Intracompany Transfer Visa',
    totalLabel: 'Your Estimated Out-of-Pocket',
    totalNote: 'Employer typically covers filing fees',
    totalRange: '$5,000 – $15,000',
    employerNote: 'Most L-1 costs are covered by your employer. Confirm with your HR or immigration counsel what is included in your transfer package.',
    closingNote: 'Your actual costs depend heavily on your employer\'s relocation package. Get a full breakdown from your HR team before making any assumptions.',
    sections: [
      {
        title: 'Typical Employer-Paid Fees',
        accent: '#4A5568',
        accentBg: '#F7F9FC',
        items: [
          { label: 'USCIS I-129 petition', value: '$460 – $4,460' },
          { label: 'Premium processing (optional)', value: '$2,805' },
          { label: 'Attorney fees (employer\'s counsel)', value: '$3,000 – $8,000' },
        ],
      },
      {
        title: 'Your Out-of-Pocket Costs',
        accent: '#1B5FA8',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Medical examinations', value: '$500 – $1,200 per person' },
          { label: 'DS-160 / consular fee', value: '$315 per person' },
          { label: 'Credential / document prep', value: '$200 – $500' },
        ],
      },
      {
        title: 'Relocation',
        accent: '#4A9FD4',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Moving costs', value: 'Often employer-covered — confirm' },
          { label: 'Temporary accommodation', value: 'Often employer-covered' },
          { label: 'Vehicle (if not covered)', value: '$1,500 – $3,500' },
        ],
      },
      {
        title: 'First Year in the US',
        accent: '#9333EA',
        accentBg: '#F5F3FF',
        items: [
          { label: 'Auto insurance (US)', value: '$3,000 – $6,000' },
          { label: 'Healthcare', value: 'Often employer-covered — confirm' },
        ],
      },
    ],
  },

  o1: {
    id: 'o1',
    label: 'O-1',
    title: 'O-1 Extraordinary Ability Visa',
    totalLabel: 'Realistic All-In Range',
    totalNote: 'Excluding relocation',
    totalRange: '$10,000 – $28,000',
    successNote: 'No government lottery and no investment requirement — but the evidence portfolio is the real work, and that\u2019s where most of the cost lives.',
    sections: [
      {
        title: 'Legal & Professional Fees',
        accent: '#1B5FA8',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Immigration attorney', value: '$5,000 – $15,000' },
          { label: 'Evidence portfolio preparation', value: '$1,000 – $3,000' },
        ],
      },
      {
        title: 'Government Filing Fees',
        accent: '#4A5568',
        accentBg: '#F7F9FC',
        items: [
          { label: 'Form I-129 petition', value: '$460 – $1,015' },
          { label: 'Premium processing (optional, 15 days)', value: '$2,805' },
        ],
      },
      {
        title: 'Documentation',
        accent: '#F0A500',
        accentBg: '#FFFBEB',
        items: [
          { label: 'Letters of recommendation, evidence compilation', value: '$500 – $2,000' },
          { label: 'Credential evaluation (if required)', value: '$200 – $400' },
        ],
      },
      {
        title: 'Relocation',
        accent: '#4A9FD4',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Moving costs', value: '$5,000 – $15,000' },
          { label: 'Temporary accommodation', value: '$3,000 – $8,000' },
          { label: 'Vehicle import', value: '$1,500 – $3,500' },
        ],
      },
      {
        title: 'First Year in the US',
        accent: '#9333EA',
        accentBg: '#F5F3FF',
        items: [
          { label: 'Auto insurance (US)', value: '$3,000 – $6,000' },
          { label: 'Healthcare (before coverage)', value: '$8,000 – $18,000' },
        ],
      },
    ],
  },

  h1b: {
    id: 'h1b',
    label: 'H-1B',
    title: 'H-1B Specialty Occupation Visa',
    totalLabel: 'Your Estimated Out-of-Pocket',
    totalNote: 'Most filing fees are employer-paid by law',
    totalRange: '$2,000 – $8,000',
    employerNote: 'By law, your employer must pay the base filing fee, ACWIA training fee, and fraud prevention fee — these cannot be passed to you. Confirm what your employer covers beyond that.',
    sections: [
      {
        title: 'Typical Employer-Paid Fees',
        accent: '#4A5568',
        accentBg: '#F7F9FC',
        items: [
          { label: 'Form I-129 base fee', value: '$460' },
          { label: 'ACWIA training fee', value: '$750 – $1,500' },
          { label: 'Fraud prevention fee', value: '$500' },
          { label: 'Attorney fees (employer\u2019s counsel)', value: '$3,000 – $8,000' },
        ],
      },
      {
        title: 'Your Out-of-Pocket Costs',
        accent: '#1B5FA8',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Premium processing (if you opt in)', value: '$2,805' },
          { label: 'Credential evaluation', value: '$200 – $400' },
          { label: 'Medical examinations', value: '$500 – $1,200 per person' },
        ],
      },
      {
        title: 'Relocation',
        accent: '#4A9FD4',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Moving costs', value: '$5,000 – $15,000' },
          { label: 'Temporary accommodation', value: '$3,000 – $8,000' },
          { label: 'Vehicle import', value: '$1,500 – $3,500' },
        ],
      },
      {
        title: 'First Year in the US',
        accent: '#9333EA',
        accentBg: '#F5F3FF',
        items: [
          { label: 'Auto insurance (US)', value: '$3,000 – $6,000' },
          { label: 'Healthcare (before coverage begins)', value: '$8,000 – $18,000' },
        ],
      },
    ],
    closingNote: 'Your actual out-of-pocket cost depends heavily on your employer\u2019s policy and whether you opt for premium processing yourself. Confirm the breakdown with HR before making assumptions.',
  },

  k1: {
    id: 'k1',
    label: 'K-1',
    title: 'K-1 Fianc\u00e9(e) Visa',
    totalLabel: 'Realistic All-In Range',
    totalNote: 'Through K-1 entry — adjustment of status after marriage is separate',
    totalRange: '$3,000 – $9,000',
    successNote: 'Many couples file the I-129F themselves without an attorney — but the adjustment of status after marriage (separately, $1,440+) is where most of the long-term cost lives.',
    sections: [
      {
        title: 'Legal & Professional Fees',
        accent: '#1B5FA8',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Immigration attorney (optional)', value: '$0 – $5,000' },
          { label: 'Petition preparation (if self-filed)', value: '$0 – $500' },
        ],
      },
      {
        title: 'Government Filing Fees',
        accent: '#4A5568',
        accentBg: '#F7F9FC',
        items: [
          { label: 'Form I-129F petition', value: '$675' },
          { label: 'DS-160 / K-1 visa fee (consulate, per person)', value: '$265 per person' },
          { label: 'Medical exam (panel physician)', value: '$200 – $500' },
        ],
      },
      {
        title: 'After Marriage — Adjustment of Status',
        accent: '#F0A500',
        accentBg: '#FFFBEB',
        items: [
          { label: 'Form I-485 adjustment of status', value: '$1,440' },
          { label: 'Work permit', value: 'Included with I-485' },
        ],
      },
      {
        title: 'Relocation',
        accent: '#4A9FD4',
        accentBg: '#EBF4FB',
        items: [
          { label: 'Moving costs', value: '$3,000 – $10,000' },
          { label: 'Temporary accommodation', value: 'Often staying with sponsor' },
        ],
      },
    ],
  },
}

const TOGGLE_ORDER = ['e2', 'eb5', 'tn', 'l1']

// ── Section card ──────────────────────────────────────────────────────────────
function CostSection({ section, familySize }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: section.accentBg }}>
        <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: section.accent }} />
        <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: section.accent }}>
          {section.title}
        </span>
      </div>
      <div className="px-4 pb-2">
        {section.items.map((item, i) => {
          const { primary, note: familyNote } = formatItemValue(item.value, familySize)
          return (
          <div
            key={i}
            className="py-2.5 flex items-start justify-between gap-3"
            style={{ borderBottom: i < section.items.length - 1 ? '1px solid #F1F5F9' : 'none' }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm" style={{ color: '#0D2B4E', fontWeight: item.bold ? '700' : '400' }}>
                {item.label}
              </span>
              {item.note && (
                <span className="text-xs italic leading-snug" style={{ color: '#4A9FD4' }}>
                  {item.note}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
              <span
                className="text-sm tabular-nums"
                style={{ color: item.bold ? '#1A7A4A' : '#0D2B4E', fontWeight: item.bold ? '700' : '600' }}
              >
                {primary}
              </span>
              {familyNote && (
                <span className="text-xs tabular-nums" style={{ color: '#1A7A4A', fontWeight: 600 }}>
                  {familyNote}
                </span>
              )}
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Info box ──────────────────────────────────────────────────────────────────
function InfoBox({ text, color = '#EBF4FB', borderColor = '#4A9FD4', textColor = '#0D2B4E' }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: color, border: `1px solid ${borderColor}` }}>
      <p className="text-sm leading-relaxed" style={{ color: textColor }}>
        {text}
      </p>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function D4CostEstimator() {
  const navigate  = useNavigate()
  const { state } = useLocation()

  const initialVisa = state?.visa ?? 'e2'
  const [activeVisa, setActiveVisa] = useState(
    VISA_DATA[initialVisa] ? initialVisa : 'e2'
  )

  useEffect(() => {
    try { localStorage.setItem('migratrak_visa', initialVisa) } catch (_) {}
  }, [initialVisa])

  const data = VISA_DATA[activeVisa]
  const familySize = getFamilySize(state?.answers)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          True Cost Estimator
        </p>
        <h1 className="text-xl font-extrabold leading-tight" style={{ color: '#FFFFFF' }}>
          What will {data.title} actually cost you?
        </h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: '#EBF4FB' }}>
          Most people underestimate by 40%. Here's a realistic breakdown for your situation.
        </p>
      </div>

      {/* Visa toggle */}
      <div className="px-4 py-3 sticky top-0 z-30" style={{ backgroundColor: '#F7F9FC', borderBottom: '1px solid #E2E8F0' }}>
        <div className="flex gap-2">
          {TOGGLE_ORDER.map((id) => {
            const isActive = id === activeVisa
            return (
              <button
                key={id}
                onClick={() => setActiveVisa(id)}
                className="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95"
                style={{
                  backgroundColor: isActive ? '#0D2B4E' : '#FFFFFF',
                  color: isActive ? '#F0A500' : '#4A5568',
                  border: isActive ? '2px solid #0D2B4E' : '2px solid #E2E8F0',
                }}
              >
                {VISA_DATA[id].label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Cost sections */}
      <div className="flex flex-col gap-3 px-4 pt-4">

        {/* L-1 employer note */}
        {data.employerNote && (
          <InfoBox text={data.employerNote} color="#EBF4FB" borderColor="#1B5FA8" />
        )}

        {data.sections.map((section) => (
          <CostSection key={section.title} section={section} familySize={familySize} />
        ))}
      </div>

      {/* Total */}
      <div className="mx-4 mt-4 rounded-2xl px-5 py-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          {data.totalLabel}
        </p>
        <p className="text-4xl font-extrabold" style={{ color: '#F0A500' }}>
          {data.totalRange.split('–')[0].trim()}
        </p>
        <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
          to {data.totalRange.split('–')[1]?.trim()}
        </p>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {data.totalNote}
        </p>
        {familySize > 1 && (
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Per-person fees above are calculated for your family of {familySize} — this range may run higher for larger families.
          </p>
        )}
      </div>

      {/* Cost disclaimer */}
      <div className="mx-4 mt-3 rounded-xl px-4 py-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
          Cost estimates are approximate ranges based on typical cases and may vary significantly. These figures do not constitute a quote or guarantee. Consult your attorney for costs specific to your situation.
        </p>
      </div>

      {/* TN success note */}
      {data.successNote && (
        <div className="mx-4 mt-3 rounded-xl px-4 py-3" style={{ backgroundColor: '#D1FAE5', border: '1px solid #1A7A4A' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#1A7A4A' }}>
            ✓ {data.successNote}
          </p>
        </div>
      )}

      {/* L-1 closing note */}
      {data.closingNote && (
        <div className="mx-4 mt-3 rounded-xl px-4 py-3" style={{ backgroundColor: '#EBF4FB', border: '1px solid #1B5FA8' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
            {data.closingNote}
          </p>
        </div>
      )}

      {/* Advisory box */}
      <div
        className="mx-4 mt-3 rounded-2xl px-5 py-4 flex flex-col gap-3"
        style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}
      >
        <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
          These ranges are realistic starting points. An immigration attorney can identify structuring options that may reduce your costs meaningfully.
        </p>
        <button
          onClick={() => navigate('/j5', { state: { filter: 'attorneys' } })}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#1B5FA8', color: '#FFFFFF' }}
        >
          Speak with an immigration specialist — find one near you →
        </button>
      </div>

      <div className="px-4 mt-3 mb-28">
        <button
          onClick={() => navigate('/j2')}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#FFFFFF', color: '#1B5FA8', border: '2px solid #E2E8F0' }}
        >
          Save my estimate
        </button>
      </div>

      <NavFooter onBack={() => navigate(-1)} nextPath="/d5" nextLabel="Choose Destination →" />
    </div>
  )
}
