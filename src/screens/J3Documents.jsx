import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '/j1' },
  { id: 'expenses',  label: 'Expenses',  path: '/j2' },
  { id: 'documents', label: 'Documents', path: '/j3' },
  { id: 'coach',     label: 'AI Coach',  path: '/j4' },
  { id: 'directory', label: 'Directory', path: '/j5' },
  { id: 'essentials',label: 'Essentials',path: '/j6' },
  { id: 'resources', label: 'Resources', path: '/resources' },
]

const STATUS = {
  uploaded:    { label: 'Uploaded',       color: '#1A7A4A', bg: '#D1FAE5', icon: '✓' },
  pending:     { label: 'Pending',        color: '#F0A500', bg: '#FEF3C7', icon: '⏳' },
  not_started: { label: 'Not Started',    color: '#A0AEC0', bg: '#F1F5F9', icon: '○' },
  flagged:     { label: 'Issue Noted',    color: '#DC2626', bg: '#FEE2E2', icon: '!' },
  follow_up:   { label: 'Follow-Up Needed', color: '#F0A500', bg: '#FEF3C7', icon: '→' },
}

const PHASES = [
  {
    id: 1,
    title: 'Phase 1 — Identity & Source of Funds',
    docs: [
      { id: 1,  name: 'Passports — all family',         status: 'uploaded' },
      { id: 2,  name: 'Birth certificates',              status: 'uploaded' },
      { id: 3,  name: 'Marriage certificate',            status: 'uploaded' },
      { id: 4,  name: 'Source of funds documentation',  status: 'uploaded' },
      { id: 5,  name: 'Bank statements — 6 months',     status: 'uploaded' },
      { id: 6,  name: 'Canadian tax returns — 3 years', status: 'uploaded' },
      { id: 7,  name: 'US tax returns',                  status: 'not_started' },
    ],
  },
  {
    id: 2,
    title: 'Phase 2 — Investment Documentation',
    docs: [
      { id: 8,  name: 'I-526 petition filed copy',                   status: 'uploaded' },
      { id: 9,  name: 'Regional center subscription agreement',       status: 'uploaded' },
      { id: 10, name: 'Investment wire transfer confirmation',        status: 'uploaded' },
      { id: 11, name: 'Escrow release confirmation',                  status: 'pending' },
    ],
  },
  {
    id: 3,
    title: 'Phase 3 — Medical & Biometrics',
    docs: [
      { id: 12, name: 'Medical examination — Todd',      status: 'uploaded' },
      { id: 13, name: 'Medical examination — Carlie',    status: 'uploaded' },
      { id: 14, name: 'Medical examination — Jordan',    status: 'not_started' },
      { id: 15, name: 'Biometrics confirmation',         status: 'uploaded' },
    ],
  },
  {
    id: 4,
    title: 'Phase 4 — USCIS Applications',
    docs: [
      { id: 16, name: 'I-485 filed copy',       status: 'uploaded' },
      { id: 17, name: 'I-765 approved copy',    status: 'uploaded' },
      { id: 18, name: 'I-131 approved copy',    status: 'uploaded' },
      { id: 19, name: 'I-94 corrected copy',    status: 'flagged',
        note: 'Issue noted — confirm correction with attorney' },
    ],
  },
  {
    id: 5,
    title: 'Phase 5 — US Life Setup',
    docs: [
      { id: 20, name: 'Florida home purchase agreement', status: 'uploaded' },
      { id: 21, name: 'SSN confirmation letters',         status: 'follow_up',
        note: 'Contact SSA to confirm receipt' },
      { id: 22, name: 'US bank account confirmation',     status: 'pending' },
      { id: 23, name: 'Florida driver\'s licence',        status: 'pending' },
    ],
  },
]

const EXPIRING = [
  {
    id: 'e1',
    name: 'Passport — Michael Chen',
    expires: 'August 2026',
    urgent: true,
  },
  {
    id: 'e2',
    name: 'Medical Examination — Sarah Chen',
    expires: 'October 2026',
    urgent: false,
  },
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
            className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2.5 gap-0.5"
            style={{ minWidth: 64 }}
          >
            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: isActive ? '#F0A500' : 'rgba(255,255,255,0.5)' }}>
              {tab.label}
            </span>
            {isActive && <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: '#F0A500' }} />}
          </button>
        )
      })}
    </div>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ number, label, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1">
      <span className="text-xl font-extrabold tabular-nums" style={{ color }}>
        {number}
      </span>
      <span className="text-xs font-semibold text-center leading-tight" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {label}
      </span>
    </div>
  )
}

// ── Expiry card ───────────────────────────────────────────────────────────────
function ExpiryCard({ doc }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div
      className="rounded-2xl px-4 py-3 flex flex-col gap-3"
      style={{
        backgroundColor: doc.urgent ? '#FEF2F2' : '#FFFBEB',
        border: `1px solid ${doc.urgent ? '#FCA5A5' : '#FCD34D'}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold" style={{ color: doc.urgent ? '#991B1B' : '#92400E' }}>
            {doc.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: doc.urgent ? '#DC2626' : '#F0A500' }}>
            Expires: {doc.expires}
          </p>
        </div>
        <span className="text-lg">{doc.urgent ? '🔴' : '🟡'}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="flex-1 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: doc.urgent ? '#991B1B' : '#92400E' }}
        >
          View
        </button>
        <button
          className="flex-1 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
          style={{
            backgroundColor: doc.urgent ? '#DC2626' : '#F0A500',
            color: '#FFFFFF',
          }}
        >
          Upload renewal
        </button>
      </div>
    </div>
  )
}

// ── Document row ──────────────────────────────────────────────────────────────
function DocRow({ doc, isLast }) {
  const s = STATUS[doc.status]
  return (
    <div
      className="flex items-start justify-between gap-3 py-2.5"
      style={{ borderBottom: isLast ? 'none' : '1px solid #F1F5F9' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: '#0D2B4E', fontWeight: doc.status === 'flagged' || doc.status === 'follow_up' ? '600' : '400' }}>
          {doc.name}
        </p>
        {doc.note && (
          <p className="text-xs mt-0.5 italic" style={{ color: s.color }}>
            {doc.note}
          </p>
        )}
      </div>
      <span
        className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: s.bg, color: s.color }}
      >
        {s.icon} {s.label}
      </span>
    </div>
  )
}

// ── Phase section ─────────────────────────────────────────────────────────────
function PhaseSection({ phase }) {
  const [open, setOpen] = useState(phase.id <= 2)

  const uploadedCount = phase.docs.filter((d) => d.status === 'uploaded').length
  const hasIssue      = phase.docs.some((d) => d.status === 'flagged' || d.status === 'follow_up')
  const hasPending    = phase.docs.some((d) => d.status === 'pending' || d.status === 'not_started')

  const badgeColor = hasIssue ? '#DC2626' : hasPending ? '#F0A500' : '#1A7A4A'
  const badgeBg    = hasIssue ? '#FEE2E2' : hasPending ? '#FEF3C7' : '#D1FAE5'
  const badgeLabel = hasIssue ? 'Needs attention' : hasPending ? 'In progress' : 'Complete'

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 gap-3 transition-opacity active:opacity-70"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 text-left">
          <span className="text-sm font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>
            {phase.title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: badgeBg, color: badgeColor }}
          >
            {badgeLabel}
          </span>
          <span className="text-xs font-semibold" style={{ color: '#A0AEC0' }}>
            {uploadedCount}/{phase.docs.length}
          </span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#A0AEC0" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-2" style={{ borderTop: '1px solid #F1F5F9' }}>
          {phase.docs.map((doc, i) => (
            <DocRow key={doc.id} doc={doc} isLast={i === phase.docs.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function J3Documents() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#4A9FD4' }}>
          Chen Family · EB-5 Documents
        </p>
        <div className="flex items-stretch gap-2">
          <StatChip number="23" label="Required"  color="#FFFFFF" />
          <div className="w-px" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <StatChip number="18" label="Uploaded"  color="#4A9FD4" />
          <div className="w-px" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <StatChip number="3"  label="Pending"   color="#F0A500" />
          <div className="w-px" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <StatChip number="2"  label="Expiring"  color="#DC2626" />
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">

        {/* Expiring soon */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#DC2626' }}>
            ⚠️ Expiring Soon
          </p>
          {EXPIRING.map((doc) => (
            <ExpiryCard key={doc.id} doc={doc} />
          ))}
        </div>

        {/* Phase sections */}
        <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#4A5568' }}>
          Documents by Phase
        </p>
        {PHASES.map((phase) => (
          <PhaseSection key={phase.id} phase={phase} />
        ))}

        {/* Bottom buttons */}
        <div className="flex flex-col gap-3 pt-1">
          <button
            className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
          >
            <span className="text-lg font-bold">+</span> Upload Document
          </button>
          <div className="flex gap-3">
            <button
              className="flex-1 py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
            >
              Request from attorney
            </button>
            <button
              className="flex-1 py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
            >
              Export PDF inventory
            </button>
          </div>
        </div>

      </div>

      <TabBar active="documents" />
    </div>
  )
}
