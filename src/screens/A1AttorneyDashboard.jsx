import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

// ─── Urgent client card ───────────────────────────────────────────────────────

function UrgentCard({ client }) {
  const isRed = client.level === 'red'
  const bg     = isRed ? '#FEF2F2' : '#FFFBEB'
  const border = isRed ? '#DC2626' : '#F0A500'
  const nameColor  = isRed ? '#991B1B' : '#92400E'
  const alertColor = isRed ? '#DC2626' : '#92400E'
  const bodyColor  = isRed ? '#7F1D1D' : '#78350F'
  const btnBg      = isRed ? '#DC2626' : '#F0A500'
  const btnColor   = isRed ? '#FFFFFF' : '#0D2B4E'

  return (
    <div className="rounded-2xl px-4 py-4 flex flex-col gap-3"
      style={{ backgroundColor: bg, border: `2px solid ${border}` }}>

      {/* Identity row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {isRed && (
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}>
                🚨 URGENT
              </span>
            )}
            <p className="text-base font-extrabold" style={{ color: nameColor }}>{client.name}</p>
          </div>
          <p className="text-xs mt-0.5 font-semibold" style={{ color: alertColor }}>
            {client.visa} · {client.filed}
          </p>
        </div>
      </div>

      {/* Alert(s) */}
      {isRed && client.alert && (
        <div className="rounded-xl px-3 py-3"
          style={{ backgroundColor: '#FFFFFF', border: '2px solid #DC2626' }}>
          <p className="text-sm font-extrabold leading-snug" style={{ color: '#7F1D1D' }}>
            {client.alert}
          </p>
        </div>
      )}
      {!isRed && client.alerts && (
        <div className="flex flex-col gap-1.5">
          {client.alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs">⚠️</span>
              <p className="text-sm font-semibold" style={{ color: bodyColor }}>{a}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action button */}
      <button
        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
        style={{ backgroundColor: btnBg, color: btnColor }}>
        {client.primaryAction} →
      </button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function A1AttorneyDashboard() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      {showModal && <AddClientModal onClose={() => setShowModal(false)} />}

      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#4A9FD4' }}>
                Client Portal — Powered by MigraTrak
              </p>
              <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>Maimone Legal</h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                  Active clients: 23
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(240,165,0,0.2)', color: '#F0A500' }}>
                  Firm tier — up to 300
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all active:scale-95"
              style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
            >
              <span className="text-base leading-none font-bold">+</span>
              Add Client
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-4 pb-16">

          {/* Needs Attention */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#DC2626' }}>
                Needs Attention
              </p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                3 clients
              </span>
            </div>
            {URGENT_CLIENTS.map(c => <UrgentCard key={c.id} client={c} />)}
          </div>

          {/* On Track */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#1A7A4A' }}>
              On Track
            </p>
            <div className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              {ON_TRACK_CLIENTS.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 gap-3"
                  style={{ borderBottom: i < ON_TRACK_CLIENTS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
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
          <div className="flex flex-col gap-2">
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#4A5568' }}>
              This Month
            </p>
            <div className="grid grid-cols-2 gap-3">
              {METRICS.map((m) => (
                <div key={m.label} className="rounded-2xl px-4 py-4"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
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

        </div>
      </div>
    </>
  )
}
