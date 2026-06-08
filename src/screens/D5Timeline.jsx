import { useNavigate, useLocation } from 'react-router-dom'
import NavFooter from '../components/NavFooter'

const DEADLINE = new Date('2026-09-30')

function monthsRemaining() {
  const now = new Date()
  return Math.max(0, (DEADLINE.getFullYear() - now.getFullYear()) * 12 + (DEADLINE.getMonth() - now.getMonth()))
}

const EB5_DEADLINE_MILESTONE = {
  marker: 'September 30, 2026',
  markerStyle: 'deadline',
  label: 'I-526E Grandfathering Deadline',
  items: [
    'File before this date to lock in current $800,000 investment threshold and program protections.',
    'Missing this date may significantly change your options.',
  ],
  callout: null,
}

const TIMELINE = [
  {
    marker: 'Today',
    markerStyle: 'start',
    label: null,
    items: [],
  },
  {
    marker: 'Weeks 1–4',
    markerStyle: 'normal',
    label: null,
    items: [
      'Find and engage immigration attorney',
      'Initial consultation and case strategy',
    ],
  },
  {
    marker: 'Months 1–3',
    markerStyle: 'normal',
    label: null,
    items: [
      'Business plan preparation',
      'Source of funds documentation',
      'Regional center or business selection',
    ],
  },
  {
    marker: 'Months 3–4',
    markerStyle: 'normal',
    label: null,
    items: [
      'I-526 or I-526E petition filed',
      'Filing fee paid: $11,160',
    ],
  },
  EB5_DEADLINE_MILESTONE,
  {
    marker: 'Months 4–24',
    markerStyle: 'warning',
    label: 'USCIS Processing',
    items: [
      'Current average: 12 to 36 months',
    ],
    callout: 'This surprises most applicants.',
  },
  {
    marker: 'After Approval',
    markerStyle: 'normal',
    label: null,
    items: [
      'I-485 or consular processing',
      'Medical examinations — all family members',
      'Biometrics appointments',
    ],
  },
  {
    marker: 'Conditional Green Card',
    markerStyle: 'green',
    label: null,
    items: [
      '2-year conditional residency granted',
    ],
  },
  {
    marker: 'Permanent Green Card',
    markerStyle: 'green',
    label: null,
    items: [
      'Remove conditions after 2 years',
    ],
  },
]

const PRO_TIPS = [
  {
    title: 'Congressional inquiry',
    body: 'If your case is delayed beyond normal processing times, contact your local congressional representative\'s office and request a case inquiry. It is free, takes 15 minutes, and can significantly accelerate USCIS processing. Most applicants never know this option exists.',
  },
  {
    title: 'Writ of Mandamus',
    body: 'A Writ of Mandamus is a federal court petition that compels USCIS to make a decision on your delayed case. Cost: $5,000 to $15,000 in attorney fees. Strong track record. Ask your attorney if your timeline qualifies.',
  },
  {
    title: 'USCIS Service Request',
    body: 'A USCIS Service Request can be filed free at uscis.gov when your case exceeds normal processing times. Do this first.',
  },
]

const DOT_STYLES = {
  start:    { bg: '#0D2B4E', border: '#0D2B4E', size: 14 },
  normal:   { bg: '#FFFFFF',  border: '#1B5FA8', size: 12 },
  warning:  { bg: '#F0A500',  border: '#F0A500', size: 14 },
  green:    { bg: '#1A7A4A',  border: '#1A7A4A', size: 14 },
  deadline: { bg: '#DC2626',  border: '#DC2626', size: 16 },
}

function Eb5Alert({ onSpecialist }) {
  const months = monthsRemaining()
  const countColor = months < 6 ? '#DC2626' : months <= 12 ? '#F0A500' : '#1A7A4A'

  return (
    <div className="mx-0 mb-0" style={{ backgroundColor: '#DC2626' }}>
      <div className="px-5 pt-5 pb-4 flex flex-col gap-3">
        <div className="flex gap-2 items-start">
          <span className="text-xl leading-none mt-0.5 flex-shrink-0">🚨</span>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide mb-2" style={{ color: '#FFFFFF' }}>
              Critical Deadline — EB-5 Investors
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#FEE2E2' }}>
              The EB-5 Regional Center program's grandfathering deadline is{' '}
              <span className="font-extrabold" style={{ color: '#FFFFFF' }}>September 30, 2026</span>.
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: '#FEE2E2' }}>
              Investors who file their I-526E petition before this date are protected under current rules — including the $800,000 investment threshold — even if the program is later modified or replaced.
            </p>
            <p className="text-sm font-semibold mt-2" style={{ color: '#FFFFFF' }}>
              If you are seriously considering EB-5, the clock is running.
            </p>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3 flex flex-col gap-1.5"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FEE2E2' }}>
            What this means for your timeline:
          </p>
          {[
            'Filing before Sept 30, 2026 locks in current investment requirements',
            'Missing this deadline may mean facing a $5,000,000 Gold Card threshold under proposed changes',
            'Most attorneys recommend beginning the process at least 6 months before any hard deadline',
          ].map((line, i) => (
            <p key={i} className="text-xs leading-relaxed flex gap-2" style={{ color: '#FEE2E2' }}>
              <span style={{ flexShrink: 0 }}>—</span>{line}
            </p>
          ))}
        </div>

        <div className="rounded-xl px-4 py-3 flex flex-col gap-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <p className="text-xs font-semibold" style={{ color: '#FEE2E2' }}>
            Time remaining until Sept 30, 2026 grandfathering deadline:
          </p>
          <p className="text-3xl font-extrabold" style={{ color: countColor }}>
            {months}
          </p>
          <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
            months remaining
          </p>
        </div>

        <button
          onClick={onSpecialist}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#FFFFFF', color: '#DC2626' }}
        >
          Speak with an EB-5 specialist now →
        </button>
      </div>
    </div>
  )
}

function TimelineRow({ item, isLast }) {
  const dot = DOT_STYLES[item.markerStyle]

  return (
    <div className="flex gap-4">
      {/* Spine */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 24 }}>
        <div
          className="rounded-full flex-shrink-0"
          style={{
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.bg,
            border: `2px solid ${dot.border}`,
            marginTop: 4,
          }}
        />
        {!isLast && (
          <div
            className="flex-1 mt-1"
            style={{ width: 2, backgroundColor: '#CBD5E0', minHeight: 32 }}
          />
        )}
      </div>

      {/* Content */}
      <div
        className="pb-6 flex-1 min-w-0"
        style={item.markerStyle === 'deadline' ? {
          borderLeft: '3px solid #DC2626',
          paddingLeft: 12,
          marginLeft: -4,
        } : {}}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-extrabold uppercase tracking-wider"
            style={{
              fontSize: item.markerStyle === 'deadline' ? '0.8rem' : '0.7rem',
              color: item.markerStyle === 'deadline' ? '#DC2626'
                   : item.markerStyle === 'warning'  ? '#F0A500'
                   : item.markerStyle === 'green'    ? '#1A7A4A'
                   : item.markerStyle === 'start'    ? '#0D2B4E'
                   : '#1B5FA8',
            }}
          >
            {item.markerStyle === 'deadline' ? '⚠️ ' : ''}{item.marker}
          </span>
          {item.label && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={item.markerStyle === 'deadline'
                ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                : { backgroundColor: '#FEF3C7', color: '#92400E' }}
            >
              {item.label}
            </span>
          )}
        </div>

        {item.items.map((line, i) => (
          <p key={i}
            className="text-sm mt-1 leading-snug"
            style={{ color: item.markerStyle === 'deadline' ? '#7F1D1D' : '#4A5568',
                     fontWeight: item.markerStyle === 'deadline' ? 600 : 400 }}>
            {line}
          </p>
        ))}

        {item.callout && (
          <div
            className="mt-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: '#FEF3C7', border: '1px solid #F0A500' }}
          >
            <p className="text-xs font-semibold italic" style={{ color: '#92400E' }}>
              "{item.callout}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function D5Timeline() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const visa = state?.visa ?? ''
  const showEb5Alert = visa === 'eb5' || visa === 'EB-5'

  const timeline = TIMELINE.filter(item =>
    item !== EB5_DEADLINE_MILESTONE || showEb5Alert
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {showEb5Alert && (
        <Eb5Alert onSpecialist={() => navigate('/j5', { state: { filter: 'attorneys' } })} />
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          EB-5 Investor Visa
        </p>
        <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#FFFFFF' }}>
          Your realistic timeline
        </h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: '#EBF4FB' }}>
          Honest. No sugarcoating.
        </p>
      </div>

      {/* Timeline */}
      <div className="px-5 pt-5">
        {timeline.map((item, i) => (
          <TimelineRow key={i} item={item} isLast={i === timeline.length - 1} />
        ))}
      </div>

      {/* Total callout */}
      <div
        className="mx-4 mt-1 mb-4 rounded-2xl px-5 py-4 flex items-center gap-3"
        style={{ backgroundColor: '#0D2B4E' }}
      >
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#4A9FD4' }}>
            Total
          </p>
          <p className="text-xl font-extrabold" style={{ color: '#F0A500' }}>
            2 to 5 years from today
          </p>
        </div>
      </div>

      {/* Pro tips */}
      <div
        className="mx-4 mb-4 rounded-2xl px-5 py-5 flex flex-col gap-4"
        style={{ backgroundColor: '#FFFBEB', border: '2px solid #F0A500' }}
      >
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider mb-0.5" style={{ color: '#92400E' }}>
            Pro Tips
          </p>
          <p className="text-sm font-bold" style={{ color: '#0D2B4E' }}>
            What most applicants do not know:
          </p>
        </div>

        {PRO_TIPS.map((tip, i) => (
          <div key={i} className="flex gap-3">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
              style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
            >
              {i + 1}
            </div>
            <div>
              <p className="text-xs font-extrabold mb-0.5" style={{ color: '#92400E' }}>
                {tip.title}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>
                {tip.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-28" />

      <NavFooter backPath="/d5" nextPath="/d7" nextLabel="Next →" />
    </div>
  )
}
