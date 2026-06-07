import { useNavigate } from 'react-router-dom'

const COST_SECTIONS = [
  {
    title: 'Investment Requirement',
    accent: '#1A7A4A',
    accentBg: '#D1FAE5',
    items: [
      {
        label: 'EB-5 minimum investment',
        value: '$800,000',
        note: 'Held in a qualifying project — not spent',
        bold: true,
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
      { label: 'Regional center fees', value: '$5,000 – $10,000' },
      { label: 'Financial advisor', value: '$2,000 – $5,000' },
    ],
  },
  {
    title: 'Government Filing Fees',
    accent: '#4A5568',
    accentBg: '#F7F9FC',
    items: [
      { label: 'I-526 petition', value: '$11,160' },
      { label: 'I-485 per person × 4', value: '$4,440' },
      { label: 'I-765 and I-131 per person', value: '$2,820' },
    ],
  },
  {
    title: 'Medical & Relocation',
    accent: '#F0A500',
    accentBg: '#FFFBEB',
    items: [
      { label: 'Medical examinations × 4', value: '$2,000 – $4,800' },
      { label: 'Moving costs', value: '$5,000 – $15,000' },
      { label: 'Temporary accommodation', value: '$3,000 – $8,000' },
      { label: 'Vehicle import', value: '$1,500 – $3,500' },
    ],
  },
  {
    title: 'First Year in the US',
    accent: '#4A9FD4',
    accentBg: '#EBF4FB',
    items: [
      { label: 'Auto insurance (US)', value: '$3,000 – $6,000' },
      { label: 'Healthcare before coverage', value: '$8,000 – $18,000' },
    ],
  },
]

function CostSection({ section }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Section header */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ backgroundColor: section.accentBg }}
      >
        <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: section.accent }} />
        <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: section.accent }}>
          {section.title}
        </span>
      </div>

      {/* Items */}
      <div className="px-4 pb-2">
        {section.items.map((item, i) => (
          <div
            key={i}
            className="py-3 flex items-start justify-between gap-3"
            style={{ borderBottom: i < section.items.length - 1 ? '1px solid #F1F5F9' : 'none' }}
          >
            <div className="flex flex-col gap-0.5">
              <span
                className="text-sm"
                style={{ color: '#0D2B4E', fontWeight: item.bold ? '700' : '400' }}
              >
                {item.label}
              </span>
              {item.note && (
                <span className="text-xs italic" style={{ color: '#4A9FD4' }}>
                  {item.note}
                </span>
              )}
            </div>
            <span
              className="text-sm flex-shrink-0 tabular-nums"
              style={{ color: item.bold ? '#1A7A4A' : '#0D2B4E', fontWeight: item.bold ? '700' : '600' }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function D4CostEstimator() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          EB-5 · Family of 4
        </p>
        <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#FFFFFF' }}>
          What will this actually cost?
        </h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: '#EBF4FB' }}>
          Most people underestimate by 40%. Here is a realistic breakdown.
        </p>
      </div>

      {/* Cost sections */}
      <div className="flex flex-col gap-3 px-4 pt-4">
        {COST_SECTIONS.map((section) => (
          <CostSection key={section.title} section={section} />
        ))}
      </div>

      {/* Total */}
      <div
        className="mx-4 mt-4 rounded-2xl px-5 py-5"
        style={{ backgroundColor: '#0D2B4E' }}
      >
        <p className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          Realistic All-In Range
        </p>
        <p className="text-4xl font-extrabold" style={{ color: '#F0A500' }}>
          $60,000
        </p>
        <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
          to $115,000
        </p>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Excluding the $800,000 investment
        </p>
      </div>

      {/* Advisory box */}
      <div
        className="mx-4 mt-3 rounded-2xl px-5 py-4 flex flex-col gap-3"
        style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}
      >
        <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
          This range varies significantly based on your specific situation. An experienced immigration attorney can often identify structuring options that reduce costs meaningfully.
        </p>
        <button
          onClick={() => navigate('/j5', { state: { filter: 'attorneys' } })}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#1B5FA8', color: '#FFFFFF' }}
        >
          Talk to a specialist — free intro call →
        </button>
      </div>

      {/* Bottom action buttons */}
      <div className="flex flex-col gap-3 px-4 mt-4 mb-8">
        <button
          onClick={() => navigate('/d5')}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
        >
          Save my estimate →
        </button>
        <button
          onClick={() => navigate('/d5')}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#FFFFFF', color: '#1B5FA8', border: '2px solid #1B5FA8' }}
        >
          Start tracking my spending →
        </button>
      </div>

    </div>
  )
}
