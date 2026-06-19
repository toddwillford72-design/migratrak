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

// ── Per-visa timeline data ────────────────────────────────────────────────────

const TIMELINES = {
  eb5: {
    label: 'EB-5 Investor Visa',
    total: '2 to 5 years from today',
    steps: [
      { marker: 'Today', markerStyle: 'start', label: null, items: [] },
      { marker: 'Weeks 1–4', markerStyle: 'normal', label: null, items: ['Find and engage immigration attorney', 'Initial consultation and case strategy'] },
      { marker: 'Months 1–3', markerStyle: 'normal', label: null, items: ['Business plan preparation', 'Source of funds documentation', 'Regional center or business selection'] },
      { marker: 'Months 3–4', markerStyle: 'normal', label: null, items: ['I-526E petition filed', 'Filing fee paid: $11,160'] },
      EB5_DEADLINE_MILESTONE,
      { marker: 'Months 4–40', markerStyle: 'warning', label: 'USCIS Processing', items: ['Current average: 12 to 36 months'], callout: 'This surprises most applicants.' },
      { marker: 'After Approval', markerStyle: 'normal', label: null, items: ['I-485 or consular processing', 'Medical examinations — all family members', 'Biometrics appointments'] },
      { marker: 'Conditional Green Card', markerStyle: 'green', label: null, items: ['2-year conditional residency granted'] },
      { marker: 'Permanent Green Card', markerStyle: 'green', label: null, items: ['I-829 filed to remove conditions after 2 years'] },
    ],
  },
  e2: {
    label: 'E-2 Treaty Investor Visa',
    total: '3 to 8 months from today',
    steps: [
      { marker: 'Today', markerStyle: 'start', label: null, items: [] },
      { marker: 'Weeks 1–4', markerStyle: 'normal', label: null, items: ['Find and engage immigration attorney', 'Choose qualifying treaty country (if applicable)', 'Initial consultation and business plan strategy'] },
      { marker: 'Months 1–3', markerStyle: 'normal', label: null, items: ['Business plan prepared to USCIS standards', 'Investment funds sourced and documented', 'Business entity formed or acquired', 'Source of funds documentation compiled'] },
      { marker: 'Months 2–4', markerStyle: 'normal', label: null, items: ['E-2 visa application filed at US consulate', 'Consular interview scheduled'] },
      { marker: 'Months 3–8', markerStyle: 'warning', label: 'Consular Processing', items: ['Consular interview — typically 2 to 6 months after filing'], callout: 'Processing times vary by consulate.' },
      { marker: 'Visa Approved', markerStyle: 'green', label: null, items: ['Initial E-2 visa issued — typically 2 to 5 years', 'Spouse receives E-2 dependent visa with work authorization (EAD)', 'Children under 21 receive dependent visas'] },
      { marker: 'Renewal', markerStyle: 'normal', label: null, items: ['E-2 is renewable indefinitely as long as the business remains active', 'No limit on number of renewals'] },
    ],
  },
  tn: {
    label: 'TN Visa (USMCA)',
    total: '1 day to 3 months from today',
    steps: [
      { marker: 'Today', markerStyle: 'start', label: null, items: [] },
      { marker: 'Weeks 1–3', markerStyle: 'normal', label: null, items: ['Confirm your profession is on the USMCA TN qualifying list', 'Obtain job offer letter from US employer', 'Gather credentials — degree certificates, licences, employment letter'] },
      { marker: 'Option A: Border Entry', markerStyle: 'green', label: 'Fastest path', items: ['Canadians and Mexicans can apply at the US port of entry', 'Decision typically same day', 'No pre-approval required'] },
      { marker: 'Option B: USCIS Filing', markerStyle: 'normal', label: null, items: ['Employer files I-129 petition with USCIS', 'Standard processing: 2 to 3 months', 'Premium processing available: 15 business days'] },
      { marker: 'TN Status Granted', markerStyle: 'green', label: null, items: ['Initial period: 3 years', 'Spouse and children receive TD dependent status (spouse cannot work on TD)'] },
      { marker: 'Renewal', markerStyle: 'normal', label: null, items: ['Renewable in 3-year increments', 'No cap on renewals', 'Can renew at border or via USCIS'] },
    ],
  },
  l1: {
    label: 'L-1 Intracompany Transfer',
    total: '2 to 6 months from today',
    steps: [
      { marker: 'Today', markerStyle: 'start', label: null, items: [] },
      { marker: 'Weeks 1–4', markerStyle: 'normal', label: null, items: ['Confirm 1 year of qualifying employment with related entity abroad', 'Determine L-1A (manager/executive) vs L-1B (specialized knowledge)', 'Engage immigration attorney'] },
      { marker: 'Months 1–2', markerStyle: 'normal', label: null, items: ['US employer prepares I-129 petition', 'Supporting documentation: org charts, financial records, job descriptions'] },
      { marker: 'Months 2–6', markerStyle: 'warning', label: 'USCIS Processing', items: ['Standard processing: 2 to 4 months', 'Premium processing available: 15 business days'], callout: 'Premium processing strongly recommended.' },
      { marker: 'L-1 Approved', markerStyle: 'green', label: null, items: ['L-1A: initial 3 years (new office: 1 year)', 'L-1B: initial 3 years', 'Spouse receives L-2 status with automatic work authorization'] },
      { marker: 'Green Card Pathway', markerStyle: 'green', label: 'EB-1C option', items: ['L-1A holders can pursue EB-1C multinational manager green card', 'No labor certification required — faster than most employment green cards'] },
    ],
  },
  h1b: {
    label: 'H-1B Specialty Occupation',
    total: '6 to 18 months from today',
    steps: [
      { marker: 'Today', markerStyle: 'start', label: null, items: [] },
      { marker: 'March 1–20', markerStyle: 'warning', label: 'Registration Window', items: ['Employer registers you in the H-1B lottery (USCIS opens early March)', 'Registration fee: $215 per beneficiary'], callout: 'Miss this window and you wait until next year.' },
      { marker: 'Late March', markerStyle: 'normal', label: null, items: ['USCIS conducts random lottery selection', 'Only selected registrations may proceed to petition filing'] },
      { marker: 'April 1 – June 30', markerStyle: 'normal', label: null, items: ['If selected: employer files full I-129 petition', 'Standard processing: 3 to 6 months', 'Premium processing available: 15 business days'] },
      { marker: 'October 1', markerStyle: 'green', label: 'Start Date', items: ['H-1B cap-subject employment begins October 1 of the fiscal year'] },
      { marker: 'H-1B Approved', markerStyle: 'green', label: null, items: ['Initial period: 3 years', 'Renewable up to 6 years total', 'Extensions beyond 6 years available if green card process is underway', 'Spouse receives H-4 status — may apply for EAD if green card process is at certain stage'] },
    ],
  },
  o1: {
    label: 'O-1 Extraordinary Ability',
    total: '2 to 6 months from today',
    steps: [
      { marker: 'Today', markerStyle: 'start', label: null, items: [] },
      { marker: 'Weeks 1–4', markerStyle: 'normal', label: null, items: ['Assess qualifying evidence — awards, press, salary, critical role', 'Engage attorney to evaluate strength of case', 'Identify US petitioner (employer or agent)'] },
      { marker: 'Months 1–2', markerStyle: 'normal', label: null, items: ['Build evidentiary package — letters of recommendation, media coverage, contracts', 'Petitioner files I-129 with supporting evidence'] },
      { marker: 'Months 2–6', markerStyle: 'warning', label: 'USCIS Processing', items: ['Standard processing: 2 to 4 months', 'Premium processing available: 15 business days'], callout: 'Evidence quality drives outcome more than most visas.' },
      { marker: 'O-1 Approved', markerStyle: 'green', label: null, items: ['Initial period: up to 3 years', 'Renewable in 1-year increments', 'O-2 and O-3 status available for essential support staff and dependants'] },
    ],
  },
  k1: {
    label: 'K-1 Fiancé(e) Visa',
    total: '8 to 18 months from today',
    steps: [
      { marker: 'Today', markerStyle: 'start', label: null, items: [] },
      { marker: 'Weeks 1–4', markerStyle: 'normal', label: null, items: ['US citizen petitioner files I-129F petition', 'Both parties must have met in person within the last 2 years', 'Filing fee: $675'] },
      { marker: 'Months 3–12', markerStyle: 'warning', label: 'USCIS Processing', items: ['I-129F processing: 5 to 12 months on average'], callout: 'This is the longest wait in the K-1 process.' },
      { marker: 'After USCIS Approval', markerStyle: 'normal', label: null, items: ['Case transferred to National Visa Center then US embassy abroad', 'Fiancé(e) attends consular interview', 'Medical examination required'] },
      { marker: 'K-1 Visa Issued', markerStyle: 'green', label: null, items: ['Single entry visa — valid 6 months', 'Must marry within 90 days of entry into the US'] },
      { marker: 'After Marriage', markerStyle: 'normal', label: null, items: ['File I-485 Adjustment of Status for green card', 'I-765 for work authorization', 'I-131 for travel permit'] },
      { marker: 'Conditional Green Card', markerStyle: 'green', label: null, items: ['2-year conditional green card typically issued 10 to 18 months after filing'] },
      { marker: 'Permanent Green Card', markerStyle: 'green', label: null, items: ['File I-751 to remove conditions after 2 years of marriage'] },
    ],
  },
  eb2niw: {
    label: 'EB-2 National Interest Waiver',
    total: '2 to 5 years from today',
    steps: [
      { marker: 'Today', markerStyle: 'start', label: null, items: [] },
      { marker: 'Weeks 1–6', markerStyle: 'normal', label: null, items: ['Engage immigration attorney', 'Assess eligibility — advanced degree or exceptional ability required', 'Build NIW argument — substantial merit, national importance, well-positioned to advance'] },
      { marker: 'Months 1–3', markerStyle: 'normal', label: null, items: ['Prepare I-140 petition with NIW argument', 'Compile evidentiary package — publications, citations, letters, impact documentation'] },
      { marker: 'Months 3–24', markerStyle: 'warning', label: 'USCIS Processing', items: ['Standard I-140 processing: 8 to 24 months depending on country of birth', 'Premium processing available: 15 business days for I-140'], callout: 'Country of birth affects visa availability, not eligibility.' },
      { marker: 'Priority Date Current', markerStyle: 'normal', label: null, items: ['Check visa bulletin monthly for your country and preference category', 'India and China-born applicants may face multi-year backlogs'] },
      { marker: 'Adjustment of Status', markerStyle: 'normal', label: null, items: ['File I-485 when priority date is current', 'Medical examination', 'Biometrics', 'Work authorization and travel permit issued during processing'] },
      { marker: 'Permanent Green Card', markerStyle: 'green', label: null, items: ['Green card issued — permanent residency granted'] },
    ],
  },
}

// Normalize the visa key from localStorage
function resolveVisa(raw) {
  const v = (raw ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (v === 'eb5') return 'eb5'
  if (v === 'e2')  return 'e2'
  if (v === 'tn')  return 'tn'
  if (v === 'l1')  return 'l1'
  if (v === 'h1b' || v === 'h1') return 'h1b'
  if (v === 'o1')  return 'o1'
  if (v === 'k1')  return 'k1'
  if (v === 'eb2niw' || v === 'eb2' || v === 'niw') return 'eb2niw'
  return 'eb5'
}

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
  const rawVisa = state?.visa ?? (() => {
    try { return localStorage.getItem('migratrak_visa') ?? '' } catch { return '' }
  })()
  const visaKey = resolveVisa(rawVisa)
  const visaData = TIMELINES[visaKey]
  const showEb5Alert = visaKey === 'eb5'

  const timeline = visaData.steps.filter(item =>
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
          {visaData.label}
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
            {visaData.total}
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
