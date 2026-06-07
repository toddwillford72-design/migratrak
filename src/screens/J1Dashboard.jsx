import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavFooter from '../components/NavFooter'

const USCIS_URL = 'https://egov.uscis.gov/casestatus/landing.do'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '/j1' },
  { id: 'expenses',  label: 'Expenses',  path: '/j2' },
  { id: 'documents', label: 'Documents', path: '/j3' },
  { id: 'coach',     label: 'AI Coach',  path: '/j4' },
  { id: 'directory', label: 'Directory', path: '/j5' },
  { id: 'essentials',label: 'Essentials',path: '/j6' },
  { id: 'resources', label: 'Resources', path: '/a1' },
  { id: 'help',      label: 'Help',      path: '/a2' },
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
  { id: 1, label: 'Attorney engaged',                    status: 'done',        date: null },
  { id: 2, label: 'I-526 filed',                         status: 'done',        date: 'Oct 4, 2024' },
  { id: 3, label: 'I-526 approved',                      status: 'done',        date: 'Aug 13, 2025' },
  { id: 4, label: 'Home purchased — Punta Gorda FL',     status: 'done',        date: null },
  { id: 5, label: 'I-765 and I-131 approved',            status: 'done',        date: 'Apr 21, 2026' },
  { id: 6, label: 'I-485 pending',                       status: 'active',      date: 'Filed May 2026' },
  { id: 7, label: 'SSN application follow-up',           status: 'upcoming',    date: null },
  { id: 8, label: 'Conditional green card interview',    status: 'upcoming',    date: null },
  { id: 9, label: 'Remove conditions',                   status: 'upcoming',    date: null },
  { id: 10,label: 'Permanent green card',                status: 'upcoming',    date: null },
]

function TabBar({ active }) {
  const navigate = useNavigate()
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto"
      style={{
        backgroundColor: '#0D2B4E',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        scrollbarWidth: 'none',
      }}
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
            <span
              className="text-xs font-semibold whitespace-nowrap"
              style={{ color: isActive ? '#F0A500' : 'rgba(255,255,255,0.5)' }}
            >
              {tab.label}
            </span>
            {isActive && (
              <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: '#F0A500' }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

function AlertCard({ alert, onDismiss }) {
  if (alert.dismissed) return null
  return (
    <div
      className="rounded-2xl px-4 py-4 flex flex-col gap-3"
      style={{
        backgroundColor: alert.urgent ? '#FEF2F2' : '#FFFBEB',
        border: `1px solid ${alert.urgent ? '#FCA5A5' : '#FCD34D'}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{alert.urgent ? '🚨' : '⚠️'}</span>
          <p className="text-sm font-extrabold" style={{ color: alert.urgent ? '#991B1B' : '#92400E' }}>
            {alert.title}
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: alert.urgent ? '#7F1D1D' : '#78350F' }}>
        {alert.body}
      </p>
      <div className="flex gap-2">
        {alert.actions.map((action, i) => (
          <button
            key={i}
            onClick={() => action.onPress ? action.onPress() : onDismiss(alert.id)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{
              backgroundColor: i === 0
                ? (alert.urgent ? '#DC2626' : '#F0A500')
                : 'rgba(0,0,0,0.06)',
              color: i === 0 ? '#FFFFFF' : (alert.urgent ? '#991B1B' : '#92400E'),
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function MilestoneRow({ milestone, isLast }) {
  const isDone     = milestone.status === 'done'
  const isActive   = milestone.status === 'active'
  const isUpcoming = milestone.status === 'upcoming'

  const dotColor = isDone ? '#1A7A4A' : isActive ? '#1B5FA8' : '#CBD5E0'
  const dotBg    = isDone ? '#1A7A4A' : isActive ? '#EBF4FB' : '#F7F9FC'
  const dotBorder= isDone ? '#1A7A4A' : isActive ? '#1B5FA8' : '#CBD5E0'

  return (
    <div className="flex gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            width: 20,
            height: 20,
            backgroundColor: dotBg,
            border: `2px solid ${dotBorder}`,
            marginTop: 2,
          }}
        >
          {isDone && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {isActive && (
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1B5FA8' }} />
          )}
        </div>
        {!isLast && (
          <div className="flex-1 mt-1" style={{ width: 2, backgroundColor: '#E2E8F0', minHeight: 20 }} />
        )}
      </div>

      {/* Label */}
      <div className="pb-4 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-semibold"
            style={{ color: isDone ? '#1A7A4A' : isActive ? '#0D2B4E' : '#A0AEC0' }}
          >
            {milestone.label}
          </span>
          {isActive && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8' }}
            >
              In progress
            </span>
          )}
        </div>
        {milestone.date && (
          <p className="text-xs mt-0.5" style={{ color: isDone ? '#4A5568' : '#4A9FD4' }}>
            {milestone.date}
          </p>
        )}
      </div>
    </div>
  )
}

function QuickAction({ icon, label, onPress, color }) {
  return (
    <button
      onClick={onPress}
      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all active:scale-95 flex-1"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color + '18' }}
      >
        <span className="text-lg">{icon}</span>
      </div>
      <span className="text-xs font-semibold text-center leading-tight" style={{ color: '#0D2B4E' }}>
        {label}
      </span>
    </button>
  )
}

export default function J1Dashboard() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([
    {
      id: 'ssn',
      title: 'SSN Follow-Up Needed',
      body: 'You applied 3 weeks ago. Call to confirm no documentation issues — errors can go undetected for months.',
      urgent: false,
      dismissed: false,
      actions: [
        { label: 'Mark as done' },
        { label: 'Call now' },
      ],
    },
    {
      id: 'insurance',
      title: 'Auto Insurance — Act Now',
      body: 'You have been in Florida for 5 months. Canadian auto insurance typically voids at 6 months on Canadian-registered vehicles. Arrange US coverage now.',
      urgent: true,
      dismissed: false,
      actions: [
        { label: 'Find insurance', onPress: () => navigate('/j6') },
        { label: 'Dismiss' },
      ],
    },
  ])

  function dismissAlert(id) {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, dismissed: true } : a))
  }

  const activeAlerts = alerts.filter((a) => !a.dismissed)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#4A9FD4' }}>
              EB-5 Investor · Started June 2024
            </p>
            <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>
              Chen Family
            </h1>
          </div>
          <div
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <span className="text-xs font-bold" style={{ color: '#F0A500' }}>
              Active
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Phase 4 of 6 — {PHASES[3]}
            </span>
            <span className="text-sm font-extrabold" style={{ color: '#F0A500' }}>
              62%
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: '62%', backgroundColor: '#F0A500' }}
            />
          </div>
          {/* Phase pip row */}
          <div className="flex justify-between mt-2">
            {PHASES.map((phase, i) => (
              <div
                key={i}
                className="h-1 rounded-full flex-1 mx-0.5"
                style={{ backgroundColor: i < 4 ? '#4A9FD4' : 'rgba(255,255,255,0.15)' }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">

        {/* Alerts */}
        {activeAlerts.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#4A5568' }}>
              Action Required
            </p>
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
            ))}
          </div>
        )}

        {/* Milestones */}
        <div
          className="rounded-2xl px-5 py-5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          <p className="text-xs font-extrabold uppercase tracking-widest mb-4" style={{ color: '#4A5568' }}>
            Case Milestones
          </p>
          {MILESTONES.map((m, i) => (
            <MilestoneRow key={m.id} milestone={m} isLast={i === MILESTONES.length - 1} />
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: '#4A5568' }}>
            Quick Actions
          </p>
          <div className="grid grid-cols-4 gap-2">
            <QuickAction
              icon="💰"
              label="Add Expense"
              color="#F0A500"
              onPress={() => navigate('/j2')}
            />
            <QuickAction
              icon="📄"
              label="Upload Doc"
              color="#1B5FA8"
              onPress={() => navigate('/j3')}
            />
            <QuickAction
              icon="🤖"
              label="Ask AI Coach"
              color="#4A9FD4"
              onPress={() => navigate('/j4')}
            />
            <QuickAction
              icon="🔍"
              label="USCIS Status"
              color="#1A7A4A"
              onPress={() => window.open(USCIS_URL, '_blank')}
            />
          </div>
        </div>

      </div>

      <TabBar active="dashboard" />
    </div>
  )
}
