import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavFooter from '../components/NavFooter'

// ─── Tab bar (no attorney link) ───────────────────────────────────────────────

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',  path: '/j1' },
  { id: 'expenses',   label: 'Expenses',   path: '/j2' },
  { id: 'documents',  label: 'Documents',  path: '/j3' },
  { id: 'coach',      label: 'AI Coach',   path: '/j4' },
  { id: 'directory',  label: 'Directory',  path: '/j5' },
  { id: 'essentials', label: 'Essentials', path: '/j6' },
  { id: 'resources', label: 'Resources', path: '/resources' },
]

// ─── Answer helpers ───────────────────────────────────────────────────────────

function loadAnswers() {
  try { return JSON.parse(localStorage.getItem('migratrak_answers') || '{}') } catch (_) { return {} }
}
function hasChildren(a) {
  return a.household === 'Me, spouse, and children' || (typeof a.children === 'string' && a.children.startsWith('Yes'))
}
function hasAgeOutChildren(a) {
  return a.children === 'Yes — aged 18, 19, or 20'
}

// ─── Provider / bank data ─────────────────────────────────────────────────────

const AUTO_PROVIDERS = [
  { id: 'p1', badge: 'CANADIAN SPECIALIST', name: 'Insurance Company A', tagline: 'Accepts Canadian driving records and Canadian-registered vehicles', stars: 5, reviewCount: 28, quote: 'Covered my Ontario plates with no hassle. Got set up same day.', reviewer: 'EB-5 applicant, Tampa, January 2026' },
  { id: 'p2', badge: null, name: 'Insurance Company B', tagline: "Foreign driver's licence accepted", stars: 4, reviewCount: 19, quote: null, reviewer: null },
  { id: 'p3', badge: null, name: 'Insurance Company C', tagline: 'Standard option for comparison', stars: 4, reviewCount: 12, quote: null, reviewer: null },
]

const BANKS = [
  { id: 'b1', name: 'TD Bank — Cross-Border Banking', detail: 'Clearwater Branch — Tampa Bay, FL', stars: 4, reviewCount: 31, quote: 'Opened my account with Canadian passport and EB-5 approval notice — no SSN required. Took 45 minutes.', reviewer: 'EB-5 applicant, Tampa, October 2025', actions: ['Get directions', 'Book appointment'] },
  { id: 'b2', name: 'RBC Cross-Border Banking', detail: null, stars: 5, reviewCount: 18, quote: 'Best option for RRSP questions and Canadian dollar conversion.', reviewer: null, actions: ['Get directions', 'Book appointment'] },
  { id: 'b3', name: 'Wise — formerly TransferWise', detail: 'Best CAD to USD exchange rates. No branch needed — fully online.', stars: 4, reviewCount: 44, quote: null, reviewer: null, actions: ['Visit website'] },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabBar({ active }) {
  const navigate = useNavigate()
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto"
      style={{ backgroundColor: '#0D2B4E', borderTop: '1px solid rgba(255,255,255,0.1)', scrollbarWidth: 'none' }}>
      {TABS.map(tab => {
        const isActive = tab.id === active
        return (
          <button key={tab.id} onClick={() => navigate(tab.path)}
            className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2.5 gap-0.5 transition-opacity active:opacity-60"
            style={{ minWidth: 64 }}>
            <span className="text-xs font-semibold whitespace-nowrap"
              style={{ color: isActive ? '#F0A500' : 'rgba(255,255,255,0.5)' }}>
              {tab.label}
            </span>
            {isActive && <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: '#F0A500' }} />}
          </button>
        )
      })}
    </div>
  )
}

function Stars({ count }) {
  return <span className="text-sm" style={{ color: '#F0A500', letterSpacing: 1 }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
}

function VerifiedBadge() {
  return (
    <span className="self-start text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#D1FAE5', color: '#1A7A4A' }}>
      ✓ Verified MigraTrak user review
    </span>
  )
}

// ─── Category screens ─────────────────────────────────────────────────────────

function AutoInsuranceScreen({ onBack }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 mb-3 transition-opacity active:opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Back to Essentials</span>
        </button>
        <h1 className="text-xl font-extrabold" style={{ color: '#FFFFFF' }}>Auto Insurance — Tampa, FL</h1>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>Specialists who cover Canadian vehicles and driving records</p>
      </div>
      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">
        {AUTO_PROVIDERS.map(p => (
          <div key={p.id} className="rounded-2xl px-4 py-4 flex flex-col gap-3"
            style={{ backgroundColor: '#FFFFFF', border: p.badge ? '2px solid #1B5FA8' : '1px solid #E2E8F0' }}>
            {p.badge && <span className="self-start text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>🍁 {p.badge}</span>}
            <div>
              <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>{p.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{p.tagline}</p>
              <div className="flex items-center gap-2 mt-1"><Stars count={p.stars} /><span className="text-xs" style={{ color: '#4A5568' }}>{p.reviewCount} verified reviews</span></div>
            </div>
            {p.quote && (
              <div className="flex flex-col gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F7F9FC' }}>
                <p className="text-xs italic leading-relaxed" style={{ color: '#4A5568' }}>"{p.quote}"</p>
                <p className="text-xs font-semibold" style={{ color: '#A0AEC0' }}>— {p.reviewer}</p>
                <VerifiedBadge />
              </div>
            )}
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95" style={{ backgroundColor: '#1B5FA8', color: '#FFFFFF' }}>Get a quote</button>
              <button className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95" style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}>Call now</button>
            </div>
          </div>
        ))}
      </div>
      <TabBar active="essentials" />
    </div>
  )
}

function BankingScreen({ onBack }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 mb-3 transition-opacity active:opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Back to Essentials</span>
        </button>
        <h1 className="text-xl font-extrabold" style={{ color: '#FFFFFF' }}>Cross-Border Banking</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Banks that work with Canadian immigrants — no SSN required to open</p>
      </div>
      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">
        {BANKS.map(b => (
          <div key={b.id} className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div>
              <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>{b.name}</p>
              {b.detail && <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{b.detail}</p>}
              <div className="flex items-center gap-2 mt-1"><Stars count={b.stars} /><span className="text-xs" style={{ color: '#4A5568' }}>{b.reviewCount} verified reviews</span></div>
            </div>
            {b.quote && (
              <div className="flex flex-col gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F7F9FC' }}>
                <p className="text-xs italic leading-relaxed" style={{ color: '#4A5568' }}>"{b.quote}"</p>
                {b.reviewer && <p className="text-xs font-semibold" style={{ color: '#A0AEC0' }}>— {b.reviewer}</p>}
                <VerifiedBadge />
              </div>
            )}
            <div className="flex gap-2">
              {b.actions.map((label, i) => (
                <button key={i} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ backgroundColor: i === 0 ? '#1B5FA8' : '#EBF4FB', color: i === 0 ? '#FFFFFF' : '#1B5FA8', border: i === 0 ? 'none' : '1px solid #4A9FD4' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <TabBar active="essentials" />
    </div>
  )
}

// ─── Checklist item components ────────────────────────────────────────────────

function DoneItem({ label }) {
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1A7A4A' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <span className="text-sm line-through" style={{ color: '#A0AEC0' }}>{label}</span>
    </div>
  )
}

function TodoItem({ label, actionLabel, onAction, last }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5"
      style={{ borderBottom: last ? 'none' : '1px solid #F1F5F9' }}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-6 h-6 rounded-full border-2 flex-shrink-0" style={{ borderColor: '#CBD5E0' }} />
        <span className="text-sm" style={{ color: '#0D2B4E' }}>{label}</span>
      </div>
      {actionLabel && (
        <button onClick={onAction}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function UrgentItem({ label, urgencyNote, actionLabel, onAction, last }) {
  return (
    <div className="py-2.5 flex flex-col gap-1.5"
      style={{ borderBottom: last ? 'none' : '1px solid #F1F5F9' }}>
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: '#FEE2E2', border: '2px solid #DC2626' }}>
          <span className="text-xs font-bold" style={{ color: '#DC2626' }}>!</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: '#991B1B' }}>{label}</p>
          {urgencyNote && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#DC2626' }}>{urgencyNote}</p>}
        </div>
      </div>
      {actionLabel && (
        <div className="pl-9">
          <button onClick={onAction}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}>
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}

function OngoingItem({ label, actionLabel, onAction, last }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5"
      style={{ borderBottom: last ? 'none' : '1px solid #F1F5F9' }}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#EBF4FB', border: '2px solid #4A9FD4' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1B5FA8" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
          </svg>
        </div>
        <span className="text-sm" style={{ color: '#0D2B4E' }}>{label}</span>
      </div>
      {actionLabel && (
        <button onClick={onAction}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function AgeOutAwarenessItem({ onCoach }) {
  return (
    <div className="rounded-xl px-4 py-3 mb-1 flex flex-col gap-2"
      style={{ backgroundColor: '#FFFBEB', border: '2px solid #F0A500' }}>
      <div className="flex items-start gap-2">
        <span className="text-base flex-shrink-0">⚠️</span>
        <p className="text-sm font-extrabold leading-snug" style={{ color: '#92400E' }}>
          Post-Secondary Education — Age-Out Awareness
        </p>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#78350F' }}>
        If your child is 18–20 and dependent on your visa application, enrolling them in a US university as an F-1 student visa holder may be worth exploring as a parallel pathway to protect their status while your case processes.
      </p>
      <button onClick={onCoach}
        className="self-start px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
        style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}>
        Ask our AI Coach →
      </button>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, subtitle, badge, open, onToggle, doneCount, totalCount, children }) {
  const hasUrgent = badge === 'urgent'
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <button onClick={onToggle}
        className="w-full flex items-start justify-between px-4 py-3.5 gap-2 transition-opacity active:opacity-70">
        <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>{title}</span>
            {hasUrgent && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                urgent
              </span>
            )}
          </div>
          {subtitle && !open && (
            <span className="text-xs" style={{ color: '#A0AEC0' }}>{subtitle}</span>
          )}
          {open && subtitle && (
            <span className="text-xs" style={{ color: '#4A9FD4' }}>{subtitle}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold" style={{ color: doneCount === totalCount && totalCount > 0 ? '#1A7A4A' : '#A0AEC0' }}>
            {doneCount}/{totalCount}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#A0AEC0" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-3" style={{ borderTop: '1px solid #F1F5F9' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function J6Essentials() {
  const navigate  = useNavigate()
  const [category, setCategory] = useState(null)
  const [answers,  setAnswers]  = useState(() => loadAnswers())

  useEffect(() => { setAnswers(loadAnswers()) }, [])

  const withChildren = hasChildren(answers)
  const withAgeOut   = hasAgeOutChildren(answers)

  // All 6 sections start expanded
  const [open, setOpen] = useState({ s1: true, s2: true, s3: true, s4: true, s5: true, s6: true })
  const toggle = (k) => setOpen(prev => ({ ...prev, [k]: !prev[k] }))

  // Category sub-screens
  if (category === 'auto-insurance') return <AutoInsuranceScreen onBack={() => setCategory(null)} />
  if (category === 'banking')        return <BankingScreen        onBack={() => setCategory(null)} />

  // Item counts per section (done items hardcoded for Chen demo)
  const s1Done = 0, s1Total = withChildren ? 11 : 9
  const s2Done = 2, s2Total = 8
  const s3Done = 0, s3Total = withChildren ? 9 : 7
  const s4Done = 0, s4Total = withChildren ? 6 : 5
  const s5Done = 0, s5Total = 4
  const s6Done = 0, s6Total = 5
  const totalDone  = s1Done + s2Done + s3Done + s4Done + s5Done + s6Done
  const totalItems = s1Total + s2Total + s3Total + s4Total + s5Total + s6Total
  const pct = Math.round((totalDone / totalItems) * 100)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          Chen Family · EB-5 Journey
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>Essentials</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Setting up your life in Tampa, FL
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {totalDone} of {totalItems} essentials complete
            </span>
            <span className="text-sm font-extrabold" style={{ color: '#F0A500' }}>{pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: '#F0A500' }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4 pb-40">

        {/* ── SECTION 1: BEFORE YOU ARRIVE ── */}
        <Section title="Before You Arrive" subtitle="Do these before leaving your home country"
          open={open.s1} onToggle={() => toggle('s1')} doneCount={s1Done} totalCount={s1Total}>
          <div className="pt-1">
            <TodoItem label="Sell or transfer your TFSA before becoming a US tax resident" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Engage cross-border accountant" actionLabel="Find one" onAction={() => navigate('/j5')} />
            <TodoItem label="File home country departure return" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Cancel or update provincial health coverage (e.g. OHIP)" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Wind down remaining home country accounts (RRSP can stay — treaty protected)" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Obtain medical records from home country doctors" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Arrange pet relocation — vaccinations and health certificate" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Set up mail forwarding with Canada Post" actionLabel="Learn more" onAction={() => {}} />
            {withChildren && (
              <>
                <TodoItem label="Request school transcripts from home country" actionLabel="Learn how" onAction={() => {}} />
                <TodoItem label="Obtain immunization records from home country" actionLabel="Check requirements" onAction={() => {}} />
              </>
            )}
            <TodoItem label="Request prescription history from home country pharmacy" actionLabel="Learn more" onAction={() => {}} last />
          </div>
        </Section>

        {/* ── SECTION 2: WEEK 1 ── */}
        <Section title="Week 1 — Do Immediately" subtitle="Your first 7 days in the US"
          badge="urgent" open={open.s2} onToggle={() => toggle('s2')} doneCount={s2Done} totalCount={s2Total}>
          <div className="pt-1">
            <TodoItem label="Research US auto insurance options — you can typically keep Canadian plates and insurance until around the 6-month mark" actionLabel="Browse options" onAction={() => setCategory('auto-insurance')} />
            <TodoItem label="Set up homeowners or renters insurance for your new home" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Know your emergency healthcare options before coverage starts" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Note your home country vehicle plate/registration expiry date" actionLabel="Learn more" onAction={() => {}} />
            <DoneItem label="Open US bank account" />
            <DoneItem label="Set up US cell phone plan" />
            <TodoItem label="Set up utilities (electric, internet, water)" actionLabel="Learn more" onAction={() => {}} />
            <UrgentItem
              label="Check I-94 for errors"
              urgencyNote="Errors on this record can delay healthcare, banking, and SSN applications — verify immediately"
              actionLabel="Check now"
              onAction={() => {}}
              last
            />
          </div>
        </Section>

        {/* ── SECTION 3: MONTH 1 ── */}
        <Section title="Month 1" subtitle="Complete within your first 30 days"
          open={open.s3} onToggle={() => toggle('s3')} doneCount={s3Done} totalCount={s3Total}>
          <div className="pt-1">
            <TodoItem label="Enroll in US health insurance" actionLabel="Find options" onAction={() => {}} />
            <TodoItem label="Apply for SSN (when eligible for your visa type)" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Update your address with USCIS (Form AR-11)" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Engage financial advisor" actionLabel="Find one" onAction={() => navigate('/j5')} />
            <TodoItem label="Get Florida driver's licence (required within 30 days of establishing residency)" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Build US credit history — open secured credit card or use Nova Credit" actionLabel="Learn how" onAction={() => {}} />
            {withChildren && (
              <>
                {withAgeOut && <AgeOutAwarenessItem onCoach={() => navigate('/j4')} />}
                <TodoItem label="Research school districts in your destination area" actionLabel="Research" onAction={() => {}} />
                <TodoItem label="Register children in school" actionLabel="Learn more" onAction={() => {}} />
              </>
            )}
            <TodoItem label="Update home country address with tax authority and banks" actionLabel="Learn more" onAction={() => {}} last />
          </div>
        </Section>

        {/* ── SECTION 4: MONTHS 1-3 ── */}
        <Section title="Months 1–3" subtitle="Complete within your first 90 days"
          open={open.s4} onToggle={() => toggle('s4')} doneCount={s4Done} totalCount={s4Total}>
          <div className="pt-1">
            <TodoItem label="SSN follow-up (3 weeks after applying)" actionLabel="Track status" onAction={() => {}} />
            <TodoItem label="Find primary care physician" actionLabel="Find one" onAction={() => navigate('/j5')} />
            <TodoItem label="Find dentist" actionLabel="Find one" onAction={() => navigate('/j5')} />
            <TodoItem label="Transfer prescription records" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Register imported vehicle in Florida (use tax due on vehicle value)" actionLabel="Learn more" onAction={() => {}} last={!withChildren} />
            {withChildren && (
              <TodoItem label="Enroll children in school (if not done in Month 1)" actionLabel="Find your district" onAction={() => {}} last />
            )}
          </div>
        </Section>

        {/* ── SECTION 5: MONTHS 3-6 ── */}
        <Section title="Months 3–6" subtitle="Time-sensitive items approaching"
          open={open.s5} onToggle={() => toggle('s5')} doneCount={s5Done} totalCount={s5Total}>
          <div className="pt-1">
            <UrgentItem
              label="Confirm auto insurance covers you beyond 6 months"
              urgencyNote="5 months elapsed — Canadian coverage may void at 6 months"
              actionLabel="Check now"
              onAction={() => setCategory('auto-insurance')}
            />
            <TodoItem label="Renew or cancel home country vehicle plates/registration before it expires" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Review US credit score progress" actionLabel="Check score" onAction={() => {}} />
            <TodoItem label="File FBAR for the prior tax year if foreign accounts exceeded $10K (due the following April 15)" actionLabel="Learn more" onAction={() => {}} last />
          </div>
        </Section>

        {/* ── SECTION 6: ONGOING — IMMIGRATION ── */}
        <Section title="Ongoing — Immigration" subtitle="Never miss these milestones"
          open={open.s6} onToggle={() => toggle('s6')} doneCount={s6Done} totalCount={s6Total}>
          <div className="pt-1">
            <OngoingItem label="Track visa application processing timeline" actionLabel="Track" onAction={() => {}} />
            <TodoItem label="File USCIS Service Request if processing exceeds normal range" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Contact congressional office if delays persist" actionLabel="Learn more" onAction={() => {}} />
            <TodoItem label="Calendar conditional green card interview (when scheduled)" actionLabel="Set reminder" onAction={() => {}} />
            <TodoItem label="Calendar I-829 filing window (90 days before 2-year green card expiry)" actionLabel="Set reminder" onAction={() => {}} last />
          </div>
        </Section>

      </div>

      <TabBar active="essentials" />
      <NavFooter backPath="/j5" />
    </div>
  )
}
