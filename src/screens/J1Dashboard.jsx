import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const USCIS_URL = 'https://egov.uscis.gov/casestatus/landing.do'

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

const PHASES = [
  'Preparation',
  'Filing',
  'Documentation',
  'USCIS Processing',
  'Approval & Entry',
  'Residency',
]

const MILESTONES = [
  { id: 1,  label: 'Immigration attorney engaged',     status: 'done',     date: null },
  { id: 2,  label: 'I-526 petition filed',             status: 'done',     date: 'Oct 4, 2024' },
  { id: 3,  label: 'I-526 approved',                   status: 'done',     date: 'Aug 13, 2025' },
  { id: 4,  label: 'Home purchased — Punta Gorda, FL', status: 'done',     date: null },
  { id: 5,  label: 'I-765 / I-131 approved',           status: 'done',     date: 'Apr 21, 2026' },
  { id: 6,  label: 'I-485 pending',                    status: 'active',   date: 'Filed May 2026' },
  { id: 7,  label: 'SSN application follow-up',        status: 'upcoming', date: null },
  { id: 8,  label: 'Conditional green card interview', status: 'upcoming', date: null },
  { id: 9,  label: 'Remove conditions (2026–2027)',    status: 'upcoming', date: null },
  { id: 10, label: 'Permanent green card',             status: 'upcoming', date: null },
]

const CHECKLIST_PREVIEW = [
  { id: 'auto',      label: 'Auto insurance',           note: 'URGENT — 5 months elapsed',   urgency: 'red' },
  { id: 'accountant',label: 'Cross-border accountant',  note: 'Not engaged yet',              urgency: 'amber' },
  { id: 'health',    label: 'US health insurance',      note: 'Not enrolled',                 urgency: 'amber' },
]

// ── Tab bar ───────────────────────────────────────────────────────────────────
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

// ── Alert card ────────────────────────────────────────────────────────────────
function AlertCard({ alert, onDismiss }) {
  if (alert.dismissed) return null
  const isRed = alert.urgent
  const titleColor = isRed ? '#991B1B' : '#92400E'
  const bodyColor  = isRed ? '#7F1D1D' : '#78350F'
  const bg         = isRed ? '#FEF2F2' : '#FFFBEB'
  const border     = isRed ? '#FCA5A5' : '#FCD34D'

  return (
    <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-2">
        <span className="text-base">{isRed ? '🚨' : '⚠️'}</span>
        <p className="text-sm font-extrabold leading-tight" style={{ color: titleColor }}>{alert.title}</p>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>{alert.body}</p>
      <div className="flex gap-2">
        {alert.actions.map((action, i) => (
          <button
            key={i}
            onClick={() => action.onPress ? action.onPress() : onDismiss(alert.id)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{
              backgroundColor: i === 0 ? (isRed ? '#DC2626' : '#F0A500') : 'rgba(0,0,0,0.06)',
              color: i === 0 ? '#FFFFFF' : titleColor,
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Milestone row ─────────────────────────────────────────────────────────────
function MilestoneRow({ milestone, isLast }) {
  const isDone   = milestone.status === 'done'
  const isActive = milestone.status === 'active'

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            width: 20, height: 20, marginTop: 2,
            backgroundColor: isDone ? '#1A7A4A' : isActive ? '#EBF4FB' : '#F7F9FC',
            border: `2px solid ${isDone ? '#1A7A4A' : isActive ? '#1B5FA8' : '#CBD5E0'}`,
          }}
        >
          {isDone && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {isActive && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1B5FA8' }} />}
        </div>
        {!isLast && <div className="flex-1 mt-1" style={{ width: 2, backgroundColor: '#E2E8F0', minHeight: 20 }} />}
      </div>
      <div className="pb-4 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold"
            style={{ color: isDone ? '#1A7A4A' : isActive ? '#0D2B4E' : '#A0AEC0' }}>
            {milestone.label}
          </span>
          {isActive && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8' }}>
              In progress
            </span>
          )}
        </div>
        {milestone.date && (
          <p className="text-xs mt-0.5" style={{ color: isDone ? '#4A5568' : '#4A9FD4' }}>{milestone.date}</p>
        )}
      </div>
    </div>
  )
}

// ── Checklist preview item ────────────────────────────────────────────────────
function ChecklistItem({ item }) {
  const isRed = item.urgency === 'red'
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <span className="text-sm">{isRed ? '🔴' : '⚠️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#0D2B4E' }}>{item.label}</p>
        <p className="text-xs" style={{ color: isRed ? '#DC2626' : '#F0A500' }}>{item.note}</p>
      </div>
    </div>
  )
}

// ── Quick action ──────────────────────────────────────────────────────────────
function QuickAction({ icon, label, onPress, color }) {
  return (
    <button
      onClick={onPress}
      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all active:scale-95 flex-1"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
        <span className="text-lg">{icon}</span>
      </div>
      <span className="text-xs font-semibold text-center leading-tight" style={{ color: '#0D2B4E' }}>{label}</span>
    </button>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function J1Dashboard() {
  const navigate = useNavigate()

  const isCanada = (() => {
    try {
      const saved = localStorage.getItem('migratrak_answers')
      if (!saved) return true // default to Canada for demo
      return JSON.parse(saved)?.country === 'Canada'
    } catch (_) { return true }
  })()

  const [alerts, setAlerts] = useState(() => {
    const list = [
      isCanada
        ? {
            id: 'auto-insurance',
            title: 'Auto Insurance — Act Now',
            body: 'You have been in Florida for 5 months. Canadian auto insurance typically voids at 6 months on Canadian-registered vehicles. Arrange US coverage this week.',
            urgent: true,
            dismissed: false,
            actions: [
              { label: 'Find insurance →', onPress: () => navigate('/j6') },
              { label: 'Dismiss' },
            ],
          }
        : {
            id: 'auto-insurance',
            title: 'Auto Insurance — Confirm Your Coverage',
            body: 'Confirm whether your home country auto insurance policy remains valid in the US and for how long. Coverage often voids sooner than expected. Arrange US coverage before any gap occurs.',
            urgent: true,
            dismissed: false,
            actions: [
              { label: 'Find insurance →', onPress: () => navigate('/j6') },
              { label: 'Dismiss' },
            ],
          },
      ...(isCanada ? [{
        id: 'plates',
        title: 'Canadian Plate Registration',
        body: 'Most provinces void vehicle registration after 6 months abroad. Driving on expired Canadian plates in Florida is a legal exposure. Check your province\'s rules now.',
        urgent: true,
        dismissed: false,
        actions: [
          { label: 'Learn more →' },
          { label: 'Dismiss' },
        ],
      }] : []),
      {
        id: 'ssn',
        title: 'SSN Follow-Up Needed',
        body: 'You applied 3 weeks ago. Call to confirm no documentation issues — errors can go undetected for months and affect healthcare and employment eligibility.',
        urgent: false,
        dismissed: false,
        actions: [
          { label: 'Mark as done' },
          { label: 'Call now' },
        ],
      },
      isCanada
        ? {
            id: 'rrsp',
            title: 'RRSP / TFSA Decision Window',
            body: 'Key decisions about your Canadian registered accounts must be made around your departure date — not after. If you haven\'t engaged a cross-border accountant yet, do this now.',
            urgent: false,
            dismissed: false,
            actions: [
              { label: 'Find a cross-border accountant →', onPress: () => navigate('/j5', { state: { filter: 'cpas' } }) },
              { label: 'Dismiss' },
            ],
          }
        : {
            id: 'home-accounts',
            title: 'Home Country Financial Accounts',
            body: 'Review all tax-advantaged accounts in your home country with a cross-border financial advisor before establishing US residency. Treatment under US tax law varies significantly by account type and country.',
            urgent: false,
            dismissed: false,
            actions: [
              { label: 'Find a financial advisor →', onPress: () => navigate('/j5') },
              { label: 'Dismiss' },
            ],
          },
      {
        id: 'credit',
        title: 'US Credit History — Start the Clock',
        body: 'You have no US credit history yet. Every month you delay costs you later. Open a secured credit card or use Nova Credit to transfer your home country credit score.',
        urgent: false,
        dismissed: false,
        actions: [
          { label: 'Learn how →' },
          { label: 'Dismiss' },
        ],
      },
    ]
    return list
  })

  function dismissAlert(id) {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, dismissed: true } : a))
  }

  const activeAlerts = alerts.filter((a) => !a.dismissed)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#1B5FA8' }}
            >
              <span className="text-sm font-extrabold" style={{ color: '#FFFFFF' }}>CF</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4A9FD4' }}>
                EB-5 Investor · Started June 2024
              </p>
              <h1 className="text-xl font-extrabold" style={{ color: '#FFFFFF' }}>Chen Family</h1>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <span className="text-xs font-bold" style={{ color: '#F0A500' }}>Active</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Overall Progress · Phase 4 of 6: USCIS Processing
            </span>
            <span className="text-sm font-extrabold" style={{ color: '#F0A500' }}>62%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div className="h-2 rounded-full" style={{ width: '62%', backgroundColor: '#F0A500' }} />
          </div>
          <div className="flex justify-between mt-2">
            {PHASES.map((_, i) => (
              <div key={i} className="h-1 rounded-full flex-1 mx-0.5"
                style={{ backgroundColor: i < 4 ? '#4A9FD4' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">

        {/* Urgent alerts */}
        {activeAlerts.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#DC2626' }}>
              🚨 Action Required
            </p>
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: '#4A5568' }}>
            Quick Actions
          </p>
          <div className="flex gap-2">
            <QuickAction icon="💰" label="+ Add Expense"      color="#F0A500" onPress={() => navigate('/j2')} />
            <QuickAction icon="📄" label="Upload Document"    color="#1B5FA8" onPress={() => navigate('/j3')} />
            <QuickAction icon="🤖" label="Ask AI Coach"       color="#4A9FD4" onPress={() => navigate('/j4')} />
          </div>
        </div>

        {/* Milestones */}
        <div className="rounded-2xl px-5 py-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-4" style={{ color: '#4A5568' }}>
            Case Milestones
          </p>
          {MILESTONES.map((m, i) => (
            <MilestoneRow key={m.id} milestone={m} isLast={i === MILESTONES.length - 1} />
          ))}
        </div>

        {/* Life setup checklist preview */}
        <div className="rounded-2xl px-5 py-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>Life Setup Checklist</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
              12 / 34
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: '#4A5568' }}>
            Things people forget — until it's too late
          </p>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full mb-4" style={{ backgroundColor: '#F1F5F9' }}>
            <div className="h-1.5 rounded-full" style={{ width: '35%', backgroundColor: '#F0A500' }} />
          </div>
          {CHECKLIST_PREVIEW.map((item) => (
            <ChecklistItem key={item.id} item={item} />
          ))}
          <button
            onClick={() => navigate('/j6')}
            className="w-full mt-3 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
          >
            View full checklist →
          </button>
        </div>

      </div>

      <TabBar active="dashboard" />
    </div>
  )
}
