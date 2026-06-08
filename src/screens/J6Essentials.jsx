import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavFooter from '../components/NavFooter'

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',  path: '/j1' },
  { id: 'expenses',   label: 'Expenses',   path: '/j2' },
  { id: 'documents',  label: 'Documents',  path: '/j3' },
  { id: 'coach',      label: 'AI Coach',   path: '/j4' },
  { id: 'directory',  label: 'Directory',  path: '/j5' },
  { id: 'essentials', label: 'Essentials', path: '/j6' },
  { id: 'resources',  label: 'Resources',  path: '/a1' },
  { id: 'help',       label: 'Help',       path: '/a2' },
]

const AUTO_PROVIDERS = [
  {
    id: 'p1',
    badge: 'CANADIAN SPECIALIST',
    name: 'Insurance Company A',
    tagline: 'Accepts Canadian driving records and Canadian-registered vehicles',
    stars: 5,
    reviewCount: 28,
    quote: 'Covered my Ontario plates with no hassle. Got set up same day.',
    reviewer: 'EB-5 applicant, Tampa, January 2026',
  },
  {
    id: 'p2',
    badge: null,
    name: 'Insurance Company B',
    tagline: "Foreign driver's licence accepted",
    stars: 4,
    reviewCount: 19,
    quote: null,
    reviewer: null,
  },
  {
    id: 'p3',
    badge: null,
    name: 'Insurance Company C',
    tagline: 'Standard option for comparison',
    stars: 4,
    reviewCount: 12,
    quote: null,
    reviewer: null,
  },
]

const BANKS = [
  {
    id: 'b1',
    name: 'TD Bank — Cross-Border Banking',
    detail: 'Clearwater Branch — Tampa Bay, FL',
    stars: 4,
    reviewCount: 31,
    quote: 'Opened my account with Canadian passport and EB-5 approval notice — no SSN required. Took 45 minutes.',
    reviewer: 'EB-5 applicant, Tampa, October 2025',
    actions: ['Get directions', 'Book appointment'],
  },
  {
    id: 'b2',
    name: 'RBC Cross-Border Banking',
    detail: null,
    stars: 5,
    reviewCount: 18,
    quote: 'Best option for RRSP questions and Canadian dollar conversion.',
    reviewer: null,
    actions: ['Get directions', 'Book appointment'],
  },
  {
    id: 'b3',
    name: 'Wise — formerly TransferWise',
    detail: 'Best CAD to USD exchange rates. No branch needed — fully online.',
    stars: 4,
    reviewCount: 44,
    quote: null,
    reviewer: null,
    actions: ['Visit website'],
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabBar({ active }) {
  const navigate = useNavigate()
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto"
      style={{ backgroundColor: '#0D2B4E', borderTop: '1px solid rgba(255,255,255,0.1)', scrollbarWidth: 'none' }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2.5 gap-0.5 transition-opacity active:opacity-60"
            style={{ minWidth: 64 }}
          >
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
  return (
    <span className="text-sm" style={{ color: '#F0A500', letterSpacing: 1 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span
      className="self-start text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: '#D1FAE5', color: '#1A7A4A' }}
    >
      ✓ Verified MigraTrak user review
    </span>
  )
}

// ─── Auto Insurance Category ──────────────────────────────────────────────────

function AutoInsuranceScreen({ onBack }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 mb-3 transition-opacity active:opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Back to Essentials</span>
        </button>
        <h1 className="text-xl font-extrabold" style={{ color: '#FFFFFF' }}>Auto Insurance — Tampa, FL</h1>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Specialists who cover Canadian vehicles and driving records
        </p>
      </div>
      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">
        {AUTO_PROVIDERS.map((p) => (
          <div key={p.id} className="rounded-2xl px-4 py-4 flex flex-col gap-3"
            style={{ backgroundColor: '#FFFFFF', border: p.badge ? '2px solid #1B5FA8' : '1px solid #E2E8F0' }}>
            {p.badge && (
              <span className="self-start text-xs font-bold px-2 py-1 rounded-full"
                style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                🍁 {p.badge}
              </span>
            )}
            <div>
              <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>{p.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{p.tagline}</p>
              <div className="flex items-center gap-2 mt-1">
                <Stars count={p.stars} />
                <span className="text-xs" style={{ color: '#4A5568' }}>{p.reviewCount} verified reviews</span>
              </div>
            </div>
            {p.quote && (
              <div className="flex flex-col gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F7F9FC' }}>
                <p className="text-xs italic leading-relaxed" style={{ color: '#4A5568' }}>"{p.quote}"</p>
                <p className="text-xs font-semibold" style={{ color: '#A0AEC0' }}>— {p.reviewer}</p>
                <VerifiedBadge />
              </div>
            )}
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{ backgroundColor: '#1B5FA8', color: '#FFFFFF' }}>
                Get a quote
              </button>
              <button className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}>
                Call now
              </button>
            </div>
          </div>
        ))}
      </div>
      <TabBar active="essentials" />
    </div>
  )
}

// ─── Banking Category ─────────────────────────────────────────────────────────

function BankingScreen({ onBack }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 mb-3 transition-opacity active:opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Back to Essentials</span>
        </button>
        <h1 className="text-xl font-extrabold" style={{ color: '#FFFFFF' }}>Cross-Border Banking</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Banks that work with Canadian immigrants — no SSN required to open
        </p>
      </div>
      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">
        {BANKS.map((b) => (
          <div key={b.id} className="rounded-2xl px-4 py-4 flex flex-col gap-3"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div>
              <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>{b.name}</p>
              {b.detail && <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{b.detail}</p>}
              <div className="flex items-center gap-2 mt-1">
                <Stars count={b.stars} />
                <span className="text-xs" style={{ color: '#4A5568' }}>{b.reviewCount} verified reviews</span>
              </div>
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
                <button key={i}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{
                    backgroundColor: i === 0 ? '#1B5FA8' : '#EBF4FB',
                    color: i === 0 ? '#FFFFFF' : '#1B5FA8',
                    border: i === 0 ? 'none' : '1px solid #4A9FD4',
                  }}>
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

// ─── Checklist item types ─────────────────────────────────────────────────────

function DoneItem({ label }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#1A7A4A' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-sm line-through" style={{ color: '#A0AEC0' }}>{label}</span>
    </div>
  )
}

function TodoItem({ label, actionLabel, onAction }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-6 h-6 rounded-full border-2 flex-shrink-0" style={{ borderColor: '#CBD5E0' }} />
        <span className="text-sm" style={{ color: '#0D2B4E' }}>{label}</span>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function UrgentItem({ label, urgencyNote, actionLabel, onAction }) {
  return (
    <div className="py-3 flex flex-col gap-2" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: '#FEE2E2', border: '2px solid #DC2626' }}>
          <span className="text-xs font-bold" style={{ color: '#DC2626' }}>!</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: '#991B1B' }}>{label}</p>
          {urgencyNote && (
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#DC2626' }}>{urgencyNote}</p>
          )}
        </div>
      </div>
      {actionLabel && (
        <div className="pl-9">
          <button
            onClick={onAction}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function J6Essentials() {
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [month1Open, setMonth1Open] = useState(false)

  if (category === 'auto-insurance') return <AutoInsuranceScreen onBack={() => setCategory(null)} />
  if (category === 'banking')        return <BankingScreen onBack={() => setCategory(null)} />

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
        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              12 of 34 essentials complete
            </span>
            <span className="text-sm font-extrabold" style={{ color: '#F0A500' }}>35%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div className="h-2 rounded-full" style={{ width: '35%', backgroundColor: '#F0A500' }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">

        {/* Week 1 section */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>Week 1 — Do First</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                1 urgent
              </span>
            </div>
          </div>
          <div className="px-4 pb-3">
            <DoneItem label="SSN application submitted" />
            <DoneItem label="Bank account opened" />
            <TodoItem
              label="Health insurance enrolled"
              actionLabel="Find options"
              onAction={() => {}}
            />
            <UrgentItem
              label="Auto Insurance"
              urgencyNote="5 months elapsed — Canadian coverage may void at 6 months"
              actionLabel="Find insurance"
              onAction={() => setCategory('auto-insurance')}
            />
            <TodoItem
              label="Cell phone activated"
              actionLabel="Find options"
              onAction={() => {}}
            />
          </div>
        </div>

        {/* Month 1 section — collapsible */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <button
            onClick={() => setMonth1Open(!month1Open)}
            className="w-full flex items-center justify-between px-4 py-3.5 transition-opacity active:opacity-70"
          >
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>Month 1</span>
              {!month1Open && (
                <span className="text-xs" style={{ color: '#A0AEC0' }}>
                  Driver's licence, utilities, credit card, school enrollment
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-semibold" style={{ color: '#A0AEC0' }}>0/4</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#A0AEC0" strokeWidth="2.5" strokeLinecap="round"
                style={{ transform: month1Open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </button>
          {month1Open && (
            <div className="px-4 pb-3" style={{ borderTop: '1px solid #F1F5F9' }}>
              <TodoItem label="Get Florida driver's licence"  actionLabel="Learn more" onAction={() => {}} />
              <TodoItem label="Set up utilities"              actionLabel="Learn more" onAction={() => {}} />
              <TodoItem label="Open secured credit card"      actionLabel="Learn how"  onAction={() => {}} />
              <TodoItem label="Register children in school"   actionLabel="Learn more" onAction={() => {}} />
            </div>
          )}
        </div>

      </div>

      <TabBar active="essentials" />
      <NavFooter backPath="/j5" nextPath="/a1" nextLabel="Next →" />
    </div>
  )
}
