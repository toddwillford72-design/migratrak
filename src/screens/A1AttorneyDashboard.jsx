import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ─── Data ─────────────────────────────────────────────────────────────────────

const URGENT_CLIENTS = [
  {
    id: 'patel',
    name: 'Patel Family',
    visa: 'EB-5',
    filed: 'Filed March 2025',
    level: 'red',
    alert: 'Dependent daughter turns 21 in 47 DAYS — AGE-OUT RISK',
    primaryAction: 'View client',
  },
  {
    id: 'chen',
    name: 'Chen Family',
    visa: 'EB-5',
    filed: 'Filed Oct 2024',
    level: 'amber',
    alerts: ['SSN follow-up overdue', 'I-485 still pending — 13 months'],
    primaryAction: 'View client',
  },
  {
    id: 'morrison',
    name: 'Morrison, James',
    visa: 'E-2',
    filed: 'Filed Jan 2026',
    level: 'amber',
    alerts: ['Has not logged in — 14 days'],
    primaryAction: 'Send reminder',
  },
]

const ON_TRACK_CLIENTS = [
  { id: 'anderson', name: 'Anderson Family',  detail: 'Phase 3, docs ready' },
  { id: 'singh',    name: 'Singh Family',     detail: 'I-526 filed Oct 2025' },
]

const METRICS = [
  { label: 'New clients activated',  value: '4'   },
  { label: 'Milestone completions',  value: '12'  },
  { label: 'Avg client progress',    value: '58%' },
  { label: 'Documents flagged',      value: '5'   },
]

const VISA_OPTIONS = ['E-2', 'EB-5', 'L-1', 'TN', 'H-1B', 'Other']
const FAMILY_SIZES = ['1', '2', '3', '4', '5+']

// ─── Add Client Modal ─────────────────────────────────────────────────────────

function AddClientModal({ onClose }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    visa: '', familySize: '', startDate: '', dependentAges: '',
  })
  const [sent, setSent] = useState(false)

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  const hasAgeOutRisk = form.dependentAges
    .split(/[,\s]+/)
    .map(s => parseInt(s, 10))
    .some(n => n === 18 || n === 19 || n === 20)

  function handleSend(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl overflow-y-auto"
        style={{ backgroundColor: '#FFFFFF', maxHeight: '92vh' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: '1px solid #E2E8F0' }}>
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: '#0D2B4E' }}>Add New Client</h2>
            <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>
              An invitation will be sent to their email
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity active:opacity-60"
            style={{ backgroundColor: '#F1F5F9' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center text-center gap-4 px-5 py-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#D1FAE5' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#1A7A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-extrabold" style={{ color: '#0D2B4E' }}>Invitation sent!</p>
              <p className="text-sm mt-1" style={{ color: '#4A5568' }}>
                {form.firstName} {form.lastName} will receive their MigraTrak link shortly.
              </p>
            </div>
            {hasAgeOutRisk && (
              <div className="w-full rounded-2xl px-4 py-3"
                style={{ backgroundColor: '#FEF2F2', border: '2px solid #DC2626' }}>
                <p className="text-sm font-extrabold" style={{ color: '#991B1B' }}>
                  🚨 Age-out risk detected
                </p>
                <p className="text-xs mt-1" style={{ color: '#7F1D1D' }}>
                  A dependent aged 18–20 was entered. An age-out alert has been activated on this client's file.
                </p>
              </div>
            )}
            <button onClick={onClose}
              className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#0D2B4E', color: '#FFFFFF' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col gap-4 px-5 pt-4 pb-8">

            {/* Name row */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                  First name
                </label>
                <input type="text" value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  placeholder="First"
                  className="w-full px-3 rounded-xl text-sm outline-none"
                  style={{ height: 44, border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
                  onFocus={e => e.target.style.borderColor = '#1B5FA8'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                  Last name
                </label>
                <input type="text" value={form.lastName}
                  onChange={e => set('lastName', e.target.value)}
                  placeholder="Last"
                  className="w-full px-3 rounded-xl text-sm outline-none"
                  style={{ height: 44, border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
                  onFocus={e => e.target.style.borderColor = '#1B5FA8'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                Client email
              </label>
              <input type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="client@example.com"
                className="w-full px-3 rounded-xl text-sm outline-none"
                style={{ height: 44, border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
                onFocus={e => e.target.style.borderColor = '#1B5FA8'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            {/* Visa type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                Visa type
              </label>
              <div className="flex flex-wrap gap-2">
                {VISA_OPTIONS.map(v => (
                  <button key={v} type="button"
                    onClick={() => set('visa', v)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                    style={{
                      backgroundColor: form.visa === v ? '#0D2B4E' : '#F1F5F9',
                      color: form.visa === v ? '#F0A500' : '#4A5568',
                      border: form.visa === v ? '2px solid #0D2B4E' : '2px solid transparent',
                    }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Family size */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                Family size
              </label>
              <div className="flex gap-2">
                {FAMILY_SIZES.map(s => (
                  <button key={s} type="button"
                    onClick={() => set('familySize', s)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                    style={{
                      backgroundColor: form.familySize === s ? '#0D2B4E' : '#F1F5F9',
                      color: form.familySize === s ? '#F0A500' : '#4A5568',
                      border: form.familySize === s ? '2px solid #0D2B4E' : '2px solid transparent',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Case start date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                Case start date
              </label>
              <input type="date" value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                className="w-full px-3 rounded-xl text-sm outline-none"
                style={{ height: 44, border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
                onFocus={e => e.target.style.borderColor = '#1B5FA8'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            {/* Dependent ages */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                Dependent ages
              </label>
              <input type="text" value={form.dependentAges}
                onChange={e => set('dependentAges', e.target.value)}
                placeholder="e.g. 16, 19, 22"
                className="w-full px-3 rounded-xl text-sm outline-none"
                style={{ height: 44, border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
                onFocus={e => e.target.style.borderColor = '#1B5FA8'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
              {hasAgeOutRisk && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-xl mt-1"
                  style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                  <span className="text-sm flex-shrink-0">🚨</span>
                  <p className="text-xs font-semibold leading-snug" style={{ color: '#991B1B' }}>
                    Age-out alert will be activated — dependent aged 18–20 detected
                  </p>
                </div>
              )}
              <p className="text-xs mt-0.5" style={{ color: '#A0AEC0' }}>
                Age-out alert fires if any dependent is 18, 19, or 20
              </p>
            </div>

            <button type="submit"
              className="w-full py-4 rounded-2xl text-base font-bold mt-1 transition-all active:scale-95"
              style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}>
              Send MigraTrak Invitation →
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Morning Briefing ────────────────────────────────────────────────────────

const BRIEFING_DATE = 'June 10, 2026'

function AlertCard({ borderColor, tintColor, name, summary, children, buttons }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: tintColor,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        borderLeft: `3px solid ${borderColor}`,
        border: '1px solid #E2E8F0',
        borderLeft: `3px solid ${borderColor}`,
      }}
      onClick={() => setOpen(o => !o)}
    >
      {/* Collapsed row — always visible */}
      <div className="flex items-center gap-3 px-4" style={{ paddingTop: 14, paddingBottom: 14, cursor: 'pointer' }}>
        <div className="flex-1 min-w-0">
          <p className="font-bold leading-snug" style={{ fontSize: 15, color: '#0D2B4E' }}>{name}</p>
          <p className="mt-0.5 leading-snug" style={{ fontSize: 13, color: '#64748B' }}>{summary}</p>
        </div>
        <span
          className="flex-shrink-0 font-bold"
          style={{
            color: borderColor,
            fontSize: 20,
            lineHeight: 1,
            display: 'inline-block',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          ›
        </span>
      </div>

      {/* Expanded content */}
      {open && (
        <div
          className="flex flex-col gap-3 px-4 pb-4"
          style={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1.5 pt-3">
            {children}
          </div>
          <div className="flex gap-2 pt-1">
            {buttons.map((btn, i) => (
              <button
                key={i}
                className="flex-1 py-2 rounded-xl text-center transition-all active:scale-95"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: '#FFFFFF',
                  color: '#0D2B4E',
                  border: '1.5px solid #CBD5E0',
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ bgColor, label }) {
  return (
    <div
      className="px-4 py-2 rounded-xl"
      style={{ backgroundColor: bgColor }}
    >
      <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#FFFFFF' }}>
        {label}
      </p>
    </div>
  )
}

function MorningBriefing() {
  return (
    <div className="flex flex-col gap-4">

      {/* Briefing header */}
      <div>
        <p className="font-extrabold uppercase tracking-[0.16em]" style={{ fontSize: 13, color: '#0D2B4E' }}>
          MORNING BRIEFING — {BRIEFING_DATE}
        </p>
        <p className="mt-0.5 font-medium" style={{ fontSize: 12, color: '#64748B' }}>
          Across your 23 active clients
        </p>
      </div>

      {/* ── SECTION 1: Critical ───────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <SectionHeader bgColor="#DC2626" label="🚨 Critical — Act this week" />
        <AlertCard
          borderColor="#DC2626"
          tintColor="#FFF5F5"
          name="PATEL FAMILY"
          summary={<>Maya turns 21 in <span style={{ color: '#DC2626', fontWeight: 700 }}>47 days</span></>}
          buttons={['Draft Action Plan', 'View Case']}
        >
          <p style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>CSPA age calculation: 20 years, 318 days</p>
          <p style={{ fontSize: 13, color: '#374151' }}>I-526 pending at Vermont Service Center.</p>
          <p style={{ fontSize: 13, color: '#374151' }}>⚡ Recommended action: File separate I-539 for Maya immediately to preserve status.</p>
        </AlertCard>
      </div>

      {/* ── SECTION 2: Important ─────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <SectionHeader bgColor="#D97706" label="⚠️ Important — Act this month" />
        <AlertCard
          borderColor="#D97706"
          tintColor="#FFFBEB"
          name="CHEN FAMILY"
          summary="Medical exam expires Aug 12"
          buttons={['Send Client Reminder', 'View Case']}
        >
          <p style={{ fontSize: 13, color: '#374151' }}>I-485 interview not yet scheduled.</p>
          <p style={{ fontSize: 13, color: '#374151' }}>Exam renewal required before interview.</p>
        </AlertCard>
        <AlertCard
          borderColor="#D97706"
          tintColor="#FFFBEB"
          name="MORRISON JAMES"
          summary="Inactive 14 days"
          buttons={['Send Nudge Email', 'View Case']}
        >
          <p style={{ fontSize: 13, color: '#374151' }}>Last activity: Document upload June 1.</p>
        </AlertCard>
      </div>

      {/* ── SECTION 3: Monitor ───────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <SectionHeader bgColor="#1B5FA8" label="👁 Monitor — Watch" />
        <AlertCard
          borderColor="#1B5FA8"
          tintColor="#EBF4FB"
          name="SINGH FAMILY"
          summary="Priority date moved forward"
          buttons={['View Analysis', 'View Case']}
        >
          <p style={{ fontSize: 13, color: '#374151' }}>Latest visa bulletin moved EB-5 priority date forward 3 months.</p>
          <p style={{ fontSize: 13, color: '#374151' }}>May be eligible to file I-485 earlier than projected.</p>
        </AlertCard>
      </div>

    </div>
  )
}

// ─── Consultation Queue ───────────────────────────────────────────────────────

const PROSPECTS = [
  {
    name: 'David Kim',
    location: 'Toronto, ON',
    visa: 'EB-5',
    budget: '$800K+',
    score: 87,
    label: 'HIGHLY PREPARED',
    summary: 'Completed full discovery. Source of funds confirmed. Actively tracking expenses for 3 weeks. Strong candidate.',
    buttons: ['View Full Profile', 'Accept', 'Decline'],
  },
  {
    name: 'Sarah Murphy',
    location: 'Vancouver, BC',
    visa: 'E-2',
    budget: '$100K – $300K',
    score: 34,
    label: 'NEEDS PREPARATION',
    summary: 'Budget may not meet E-2 investment threshold. No documents prepared yet. Recommend 2–3 more weeks in MigraTrak before consultation.',
    buttons: ['View Full Profile', 'Accept', 'Send Resources First'],
  },
  {
    name: 'Michael Chen',
    location: 'Calgary, AB',
    visa: 'TN Visa',
    budget: 'Not yet disclosed',
    score: 61,
    label: 'MODERATE READINESS',
    summary: 'Completed discovery flow. Document preparation not yet started. Timeline: 6–12 months.',
    buttons: ['View Full Profile', 'Accept', 'Request More Info'],
  },
]

function scoreColor(score) {
  if (score >= 75) return '#1A7A4A'
  if (score >= 50) return '#F0A500'
  return '#C00000'
}

function ProspectCard({ prospect }) {
  const color = scoreColor(prospect.score)
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderLeft: `3px solid ${color}`,
        borderRadius: 16,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Top row: score badge + name/meta */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            backgroundColor: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{prospect.score}</span>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.06em', textAlign: 'center', whiteSpace: 'nowrap' }}>
            {prospect.label}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0D2B4E', margin: 0 }}>{prospect.name}</p>
          <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>{prospect.location}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: '#EBF4FB', color: '#1B5FA8', borderRadius: 6, padding: '2px 8px' }}>
              {prospect.visa}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: '#F1F5F9', color: '#4A5568', borderRadius: 6, padding: '2px 8px' }}>
              {prospect.budget}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: 0 }}>{prospect.summary}</p>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 6 }}>
        {prospect.buttons.map((btn, i) => (
          <button
            key={i}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: i === 1 ? color : '#FFFFFF',
              color: i === 1 ? '#FFFFFF' : '#0D2B4E',
              border: i === 1 ? `1.5px solid ${color}` : '1.5px solid #CBD5E0',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  )
}

function ConsultationQueue() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#0D2B4E', textTransform: 'uppercase', letterSpacing: '0.14em', margin: 0 }}>
          CONSULTATION REQUESTS
        </p>
        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>3 prospects waiting for review</p>
      </div>
      {PROSPECTS.map((p) => <ProspectCard key={p.name} prospect={p} />)}
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function A1AttorneyDashboard() {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      {showModal && <AddClientModal onClose={() => setShowModal(false)} />}

      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-extrabold uppercase mb-1" style={{ fontSize: 11, color: '#4A9FD4', letterSpacing: '0.14em' }}>
                ATTORNEY PORTAL
              </p>
              <h1 className="font-extrabold" style={{ fontSize: 22, color: '#FFFFFF', lineHeight: 1.2 }}>Maimone Legal</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="font-bold px-2.5 py-0.5 rounded-full" style={{ fontSize: 12, backgroundColor: 'rgba(240,165,0,0.2)', color: '#F0A500' }}>
                  Active clients: 23
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-extrabold transition-all active:scale-95"
                style={{ fontSize: 14, backgroundColor: '#F0A500', color: '#0D2B4E' }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>+</span>
                Add Client
              </button>
              <button
                onClick={async () => { await supabase.auth.signOut(); navigate('/') }}
                className="transition-opacity active:opacity-60"
                style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Sign out
              </button>
              <button onClick={() => navigate('/a-billing')} className="transition-opacity active:opacity-60" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Billing</button>
            </div>
          </div>
        </div>

        {/* Attorney legal disclaimer */}
        <div className="px-4 py-2.5" style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            Client data is for case management purposes only. MigraTrak does not provide legal advice.
          </p>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-4 pb-16">

          {/* Morning Briefing */}
          <MorningBriefing />

          {/* Consultation Queue */}
          <ConsultationQueue />

          {/* On Track */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#1A7A4A' }}>
              On Track
            </p>
            <div className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              {ON_TRACK_CLIENTS.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 gap-3"
                  style={{ borderBottom: i < ON_TRACK_CLIENTS.length - 1 ? '1px solid #F1F5F9' : 'none', borderLeft: '3px solid #1A7A4A' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0D2B4E' }}>{c.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#4A9FD4' }}>{c.detail}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#D1FAE5' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#1A7A4A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
              {/* +18 more row */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: '1px solid #F1F5F9', backgroundColor: '#FAFBFC' }}>
                <p className="text-sm font-semibold" style={{ color: '#4A5568' }}>
                  + 18 more clients on track
                </p>
                <button
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}>
                  View all clients
                </button>
              </div>
            </div>
          </div>

          {/* Monthly metrics */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <p className="text-xs font-extrabold uppercase tracking-widest px-4 pt-4 pb-3" style={{ color: '#4A5568' }}>
              This Month
            </p>
            <div className="grid grid-cols-2 divide-x divide-y" style={{ borderColor: '#F1F5F9' }}>
              {[
                { label: 'New clients',          value: '4'   },
                { label: 'Milestones completed', value: '12'  },
                { label: 'Avg progress',         value: '58%' },
                { label: 'Docs flagged',         value: '5'   },
              ].map((m) => (
                <div key={m.label} className="px-4 py-4">
                  <p className="text-2xl font-extrabold" style={{ color: '#0D2B4E' }}>{m.value}</p>
                  <p className="text-xs mt-0.5 leading-tight" style={{ color: '#4A5568' }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom add client CTA */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ backgroundColor: '#0D2B4E', color: '#F0A500' }}
          >
            <span className="text-xl leading-none">+</span> Add New Client
          </button>

          <button
            onClick={() => navigate('/a3')}
            className="w-full py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ backgroundColor: '#1A7A4A', color: '#FFFFFF' }}
          >
            ✉️ Send Client Invitation
          </button>

        </div>
      </div>
    </>
  )
}
