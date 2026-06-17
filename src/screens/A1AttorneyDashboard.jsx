import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ─── Data ─────────────────────────────────────────────────────────────────────

const VISA_OPTIONS = ['E-2', 'EB-5', 'L-1', 'TN', 'H-1B', 'Other']
const FAMILY_SIZES = ['1', '2', '3', '4', '5+']

// ─── Add Client Modal ─────────────────────────────────────────────────────────

function AddClientModal({ onClose, attorneyProfile }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    visa: '', familySize: '', startDate: '', dependentAges: '',
  })
  const [sent, setSent]           = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  const hasAgeOutRisk = form.dependentAges
    .split(/[,\s]+/)
    .map(s => parseInt(s, 10))
    .some(n => n === 18 || n === 19 || n === 20)

  async function handleSend(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const dependentAges = form.dependentAges
        ? form.dependentAges.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
        : []

      const response = await fetch('/api/add-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          name: `${form.firstName} ${form.lastName}`.trim(),
          visaType: form.visa || null,
          familySize: parseInt(form.familySize, 10) || 1,
          caseStartDate: form.startDate || null,
          dependentAges,
          attorneyId: user?.id,
          attorneyName: attorneyProfile?.name || 'Your Attorney',
          firmName: attorneyProfile?.firm_name || 'Maimone Legal',
        }),
      })

      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create client')
      }

      setSent(true)
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong — please try again.')
    } finally {
      setSubmitting(false)
    }
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

            {submitError && (
              <div className="px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <p className="text-xs font-semibold" style={{ color: '#991B1B' }}>{submitError}</p>
              </div>
            )}
            <button type="submit" disabled={submitting}
              className="w-full py-4 rounded-2xl text-base font-bold mt-1 transition-all active:scale-95"
              style={{ backgroundColor: submitting ? '#94A3B8' : '#F0A500', color: '#0D2B4E', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Creating account…' : 'Send MigraTrak Invitation →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Morning Briefing ────────────────────────────────────────────────────────

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

function MorningBriefing({ clients }) {
  const today = new Date()
  const todayLabel = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const clientCount = clients ? clients.length : 0

  // Build critical alerts — dependents aged 18–20 (age-out risk)
  const criticalAlerts = []
  if (clients) {
    for (const c of clients) {
      const ages = Array.isArray(c.dependent_ages) ? c.dependent_ages : []
      for (const age of ages) {
        if (age >= 18 && age <= 20) {
          const daysUntil21 = Math.round((21 - age) * 365.25)
          criticalAlerts.push({
            key: c.id + '-ageout-' + age,
            name: (c.name || 'Client').toUpperCase(),
            summary: <>{c.visa_type} · Dependent age {age} — <span style={{ color: '#DC2626', fontWeight: 700 }}>~{daysUntil21} days until 21</span></>,
            body: `Dependent aged ${age} detected. Monitor CSPA calculation and consider filing to preserve status before age-out.`,
          })
        }
      }
    }
  }

  // Build important alerts — inactive 14+ days
  const importantAlerts = []
  if (clients) {
    for (const c of clients) {
      if (c.last_sign_in_at) {
        const daysSince = Math.floor((today - new Date(c.last_sign_in_at)) / 86400000)
        if (daysSince >= 14) {
          importantAlerts.push({
            key: c.id + '-inactive',
            name: (c.name || 'Client').toUpperCase(),
            summary: `Inactive ${daysSince} days`,
            body: `Last sign-in was ${daysSince} days ago. Consider sending a check-in or reminder.`,
          })
        }
      }
    }
  }

  const hasAny = criticalAlerts.length > 0 || importantAlerts.length > 0

  return (
    <div className="flex flex-col gap-4">

      {/* Briefing header */}
      <div>
        <p className="font-extrabold uppercase tracking-[0.16em]" style={{ fontSize: 13, color: '#0D2B4E' }}>
          MORNING BRIEFING — {todayLabel}
        </p>
        <p className="mt-0.5 font-medium" style={{ fontSize: 12, color: '#64748B' }}>
          Across your {clientCount > 0 ? clientCount : '—'} active client{clientCount !== 1 ? 's' : ''}
        </p>
      </div>

      {!hasAny && (
        <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <p className="font-semibold" style={{ fontSize: 14, color: '#1A7A4A' }}>✓ No urgent items — all clients on track</p>
        </div>
      )}

      {/* ── SECTION 1: Critical ───────────────────────────────────── */}
      {criticalAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionHeader bgColor="#DC2626" label="🚨 Critical — Act this week" />
          {criticalAlerts.map(alert => (
            <AlertCard
              key={alert.key}
              borderColor="#DC2626"
              tintColor="#FFF5F5"
              name={alert.name}
              summary={alert.summary}
              buttons={['Draft Action Plan', 'View Case']}
            >
              <p style={{ fontSize: 13, color: '#374151' }}>{alert.body}</p>
            </AlertCard>
          ))}
        </div>
      )}

      {/* ── SECTION 2: Important ─────────────────────────────────── */}
      {importantAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionHeader bgColor="#D97706" label="⚠️ Important — Act this month" />
          {importantAlerts.map(alert => (
            <AlertCard
              key={alert.key}
              borderColor="#D97706"
              tintColor="#FFFBEB"
              name={alert.name}
              summary={alert.summary}
              buttons={['Send Nudge Email', 'View Case']}
            >
              <p style={{ fontSize: 13, color: '#374151' }}>{alert.body}</p>
            </AlertCard>
          ))}
        </div>
      )}

    </div>
  )
}

// ─── Consultation Queue ───────────────────────────────────────────────────────

function fitColor(fitRating) {
  if (fitRating === 'Strong' || fitRating === 'Strong Fit')   return '#1A7A4A'
  if (fitRating === 'Possible' || fitRating === 'Possible Fit') return '#D97706'
  return '#DC2626'
}
function fitBg(fitRating) {
  if (fitRating === 'Strong' || fitRating === 'Strong Fit')   return '#D1FAE5'
  if (fitRating === 'Possible' || fitRating === 'Possible Fit') return '#FEF3C7'
  return '#FEE2E2'
}
function fitLabel(fitRating) {
  if (fitRating === 'Strong')   return 'Strong Fit'
  if (fitRating === 'Possible') return 'Possible Fit'
  if (fitRating === 'Unlikely') return 'Unlikely Fit'
  return fitRating
}
function ProspectCard({ prospect, onAction }) {
  const [expanded, setExpanded] = useState(false)
  const [acting, setActing]     = useState(null)
  const color = fitColor(prospect.fit_rating || prospect.fitRating)
  const bg    = fitBg(prospect.fit_rating || prospect.fitRating)
  const label = fitLabel(prospect.fit_rating || prospect.fitRating)
  const visaDisplay   = prospect.visa_type   || prospect.visa   || '—'
  const budgetDisplay = prospect.budget_range || prospect.budget || '—'
  const aiNote        = prospect.ai_consultation_note || prospect.aiNote || ''
  const score         = prospect.score ?? '—'
  const statusDisplay = prospect.status === 'pending' ? 'Consultation Requested' : prospect.status === 'approved' ? 'Approved' : prospect.status === 'declined' ? 'Declined' : prospect.status === 'info_requested' ? 'More Information Requested' : prospect.status === 'converted' ? 'Converted to Client' : prospect.status || 'Pending'
  const submittedDays = prospect.created_at ? Math.floor((Date.now() - new Date(prospect.created_at).getTime()) / 86400000) : prospect.submittedDays ?? '—'
  const buttons = prospect.status === 'pending' ? ['Approve', 'Decline', 'More Info'] : prospect.status === 'info_requested' ? ['Follow Up', 'Decline'] : prospect.status === 'approved' ? ['Convert to Client'] : []
  async function handleBtn(btn) {
    const newStatus = btn === 'Approve' ? 'approved' : btn === 'Decline' ? 'declined' : btn === 'More Info' ? 'info_requested' : btn === 'Follow Up' ? 'info_requested' : btn === 'Convert to Client' ? 'converted' : null
    if (!newStatus || !onAction) return
    setActing(btn)
    await onAction(prospect.id, newStatus, prospect)
    setActing(null)
  }
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: `3px solid ${color}`, borderRadius: 16, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{score}</span>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.04em', textAlign: 'center' }}>/ 100</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0D2B4E', margin: 0 }}>{prospect.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: bg, color, borderRadius: 6, padding: '2px 8px' }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: '#EBF4FB', color: '#1B5FA8', borderRadius: 6, padding: '2px 8px' }}>{visaDisplay}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#4A5568' }}>💰 {budgetDisplay}</span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>Submitted {submittedDays} day{submittedDays !== 1 ? 's' : ''} ago</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#4A5568' }}>{statusDisplay}</span>
      </div>
      {aiNote ? (
        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>🤖</span>
          <p style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5, margin: 0 }}><span style={{ fontWeight: 700, color: '#0D2B4E' }}>AI note: </span>{aiNote}</p>
        </div>
      ) : null}
      <button onClick={() => setExpanded(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score breakdown</span>
        <span style={{ fontSize: 16, color: '#94A3B8', fontWeight: 700, display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>›</span>
      </button>
      {expanded && prospect.assessment_answers?.breakdown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {prospect.assessment_answers.breakdown.map((item) => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#4A5568' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0D2B4E' }}>{item.pts}/{item.max}</span>
              </div>
              <div style={{ height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round((item.pts / item.max) * 100)}%`, backgroundColor: color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {buttons.length > 0 && (
        <div style={{ display: 'flex', gap: 6 }}>
          {buttons.map((btn, i) => (
            <button key={i} disabled={!!acting} onClick={() => handleBtn(btn)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, fontSize: 12, fontWeight: 700, backgroundColor: i === 0 ? color : '#FFFFFF', color: i === 0 ? '#FFFFFF' : '#0D2B4E', border: i === 0 ? `1.5px solid ${color}` : '1.5px solid #CBD5E0', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1 }}>
              {acting === btn ? '…' : btn}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
function CheckinPreview({ client }) {
  const [expanded, setExpanded] = useState(false)
  if (!client) return null

  const clientName = client.name || 'Your client'
  const visaType   = client.visa_type || 'Immigration'
  const caseStart  = client.case_start_date
    ? `Case started ${new Date(client.case_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : ''
  const monthsIn = client.case_start_date
    ? Math.max(1, Math.floor((Date.now() - new Date(client.case_start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#0D2B4E' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16 }}>💬</span>
          <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#4A9FD4' }}>Automated Check-ins</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1A7A4A' }} />
          <span className="text-xs font-bold" style={{ color: '#4ADE80' }}>Active</span>
        </div>
      </div>
      <div className="px-4 py-3 flex items-start gap-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EBF4FB' }}>
          <span style={{ fontSize: 18 }}>👨‍👩‍👧</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold" style={{ color: '#0D2B4E' }}>{clientName}</p>
            {monthsIn && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>Month {monthsIn}</span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{visaType}{caseStart ? ` · ${caseStart}` : ''}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: '#1A7A4A' }}>✓ Monthly check-in scheduled — sends tonight at 10pm ET</p>
        </div>
      </div>
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center justify-between px-4 py-3 transition-opacity active:opacity-70" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <p className="text-xs font-bold" style={{ color: '#1B5FA8' }}>{expanded ? 'Hide email preview' : 'Preview the email MigraTrak will send →'}</p>
        <span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 700, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block' }}>›</span>
      </button>
      {expanded && (
        <div className="mx-4 mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
          <div className="px-4 py-3" style={{ backgroundColor: '#0D2B4E' }}>
            <p className="text-xs font-extrabold" style={{ color: '#FFFFFF' }}>Maimone Legal</p>
            <p className="text-xs mt-0.5" style={{ color: '#4A9FD4' }}>Immigration Law</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>Subject: A quick update on your case — Maimone Legal</p>
            {CHECKIN_PREVIEW_MESSAGE.split('\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-sm leading-relaxed mb-3" style={{ color: '#4A5568' }}>{para}</p>
            ))}
            <div className="mt-3 rounded-lg py-2.5 text-center" style={{ backgroundColor: '#1B5FA8' }}>
              <p className="text-xs font-bold" style={{ color: '#FFFFFF' }}>Open my MigraTrak dashboard →</p>
            </div>
          </div>
          <div className="px-4 py-2.5 text-center" style={{ backgroundColor: '#F7F9FC', borderTop: '1px solid #E2E8F0' }}>
            <p className="text-xs" style={{ color: '#A0AEC0' }}>MigraTrak provides educational information only — not legal advice.</p>
          </div>
        </div>
      )}
      <div className="px-4 pb-3">
        <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>MigraTrak evaluates all active clients daily and sends context-aware check-ins automatically — from your practice name, never from MigraTrak.</p>
      </div>
    </div>
  )
}

function ZapierSetup({ attorneyId, attorneyProfile, onSaved }) {
  const [expanded, setExpanded]     = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState(null)
  const currentUrl = attorneyProfile?.zapier_webhook_url || ''
  async function handleSave() {
    if (!webhookUrl.startsWith('https://hooks.zapier.com/')) { setError('Please enter a valid Zapier webhook URL'); return }
    setSaving(true); setError(null)
    try {
      const { error: err } = await supabase.from('users').update({ zapier_webhook_url: webhookUrl }).eq('id', attorneyId)
      if (err) throw err
      onSaved(webhookUrl); setSaved(true); setTimeout(() => setSaved(false), 3000); setExpanded(false)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }
  async function handleRemove() {
    try { await supabase.from('users').update({ zapier_webhook_url: null }).eq('id', attorneyId); onSaved(null); setWebhookUrl('') } catch (err) { setError(err.message) }
  }
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center justify-between px-4 py-4" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 20 }}>⚡</span>
          <div className="text-left">
            <p className="text-sm font-extrabold" style={{ color: '#0D2B4E', margin: 0 }}>CRM Integration</p>
            <p className="text-xs mt-0.5" style={{ color: currentUrl ? '#1A7A4A' : '#94A3B8', margin: 0 }}>{currentUrl ? '✓ Zapier webhook connected' : 'Connect Zapier to push prospects to your CRM'}</p>
          </div>
        </div>
        <span style={{ fontSize: 16, color: '#94A3B8', fontWeight: 700, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>›</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid #F1F5F9' }}>
          <div className="pt-3">
            <p className="text-xs font-bold mb-1" style={{ color: '#0D2B4E' }}>How it works</p>
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>When you convert a prospect to a client, MigraTrak sends their full profile to your CRM via Zapier automatically.</p>
          </div>
          {currentUrl && (
            <div className="rounded-xl px-3 py-3 flex items-center justify-between" style={{ backgroundColor: '#D1FAE5', border: '1px solid #1A7A4A' }}>
              <div>
                <p className="text-xs font-bold" style={{ color: '#1A7A4A' }}>Webhook connected</p>
                <p className="text-xs mt-0.5" style={{ color: '#065F46', wordBreak: 'break-all' }}>{currentUrl.slice(0, 50)}…</p>
              </div>
              <button onClick={handleRemove} className="text-xs font-bold ml-3 flex-shrink-0" style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input type="url" placeholder="https://hooks.zapier.com/hooks/catch/..." value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="w-full px-3 py-3 rounded-xl text-sm" style={{ border: '1px solid #CBD5E0', outline: 'none', color: '#0D2B4E' }} />
            {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
            <button onClick={handleSave} disabled={saving || !webhookUrl} className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95" style={{ backgroundColor: saving || !webhookUrl ? '#94A3B8' : '#F0A500', color: '#0D2B4E', opacity: saving || !webhookUrl ? 0.7 : 1 }}>
              {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save webhook URL'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ConsultationQueue({ attorneyId, attorneyProfile }) {
  const [prospects, setProspects] = useState(null)
  const [error, setError]         = useState(null)
  async function load() {
    if (!attorneyId) return
    try {
      const { data, error: err } = await supabase.from('prospects').select('*').eq('attorney_id', attorneyId).order('created_at', { ascending: false })
      if (err) throw err
      setProspects(data || [])
    } catch (err) { setError(err.message); setProspects([]) }
  }
  useEffect(() => { load() }, [attorneyId])
  async function handleAction(prospectId, newStatus, prospect) {
    try {
      const action = newStatus === 'approved' ? 'approve' : newStatus === 'declined' ? 'decline' : newStatus === 'info_requested' ? 'more_info' : null
      if (action) {
        await fetch('/api/respond-prospect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, prospectId, prospectName: prospect.name, prospectEmail: prospect.email, attorneyName: attorneyProfile?.name || 'Your attorney', firmName: attorneyProfile?.firm_name || '', visaType: prospect.visa_type || '' }) })
      }
      if (newStatus === 'converted') {
        await fetch('/api/convert-prospect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prospectId, attorneyId, zapierWebhookUrl: attorneyProfile?.zapier_webhook_url || null }) })
      }
      setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, status: newStatus } : p))
    } catch (err) { setError(err.message) }
  }
  const pending   = prospects?.filter(p => ['pending', 'info_requested'].includes(p.status)) || []
  const processed = prospects?.filter(p => ['approved', 'declined', 'converted'].includes(p.status)) || []
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#0D2B4E', textTransform: 'uppercase', letterSpacing: '0.14em', margin: 0 }}>CONSULTATION REQUESTS</p>
        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>{prospects === null ? 'Loading…' : `${pending.length} prospect${pending.length !== 1 ? 's' : ''} waiting for review`}</p>
      </div>
      {error && <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 16, padding: '12px 16px' }}><p style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', margin: 0 }}>{error}</p></div>}
      {prospects === null ? (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '16px' }}><p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>Loading prospects…</p></div>
      ) : pending.length === 0 && processed.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#4A5568', margin: 0 }}>No prospects yet</p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0 0' }}>Prospects appear here when clients complete the discovery flow</p>
        </div>
      ) : (
        <>
          {pending.map(p => <ProspectCard key={p.id} prospect={p} onAction={handleAction} />)}
          {processed.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Recently processed</p>
              {processed.map(p => <ProspectCard key={p.id} prospect={p} onAction={handleAction} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Policy Intelligence ─────────────────────────────────────────────────────

const COMMUNICATION_DRAFT = `Dear [Client Name],

I wanted to reach out personally regarding a recent USCIS policy change that may affect your case.

On June 5, 2026, USCIS announced that Adjustment of Status (Form I-485) will now only be approved under "extraordinary circumstances." This is a significant change from prior practice where adjustment was relatively routine for eligible applicants.

What this means for you: We are reviewing your specific situation carefully and will follow up within 48 hours with our assessment. Please do not take any action on your case without speaking with our office first.

We are monitoring this situation closely. Please do not hesitate to reach out with any questions.

Warm regards,
Mena Maimone
Maimone Legal
Fort Lauderdale, FL`

function PolicyClientChip({ label, bgColor }) {
  return (
    <span
      className="px-3 py-1.5 rounded-full font-bold"
      style={{ fontSize: 11, backgroundColor: bgColor, color: '#FFFFFF' }}
    >
      {label}
    </span>
  )
}

function PolicyCard({ defaultOpen, borderColor, badgeBg, badgeColor, badgeLabel, title, date, body, infoBarBg, infoBarColor, infoBarText, chips, chipColor, onSendCommunication }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #E2E8F0',
        borderLeft: `4px solid ${borderColor}`,
      }}
    >
      <div
        className="flex items-start gap-3 px-4"
        style={{ paddingTop: 16, paddingBottom: 16, cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider"
              style={{ fontSize: 10, backgroundColor: badgeBg, color: badgeColor }}
            >
              {badgeLabel}
            </span>
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>{date}</span>
          </div>
          <p className="font-bold leading-snug mt-1.5" style={{ fontSize: 15, color: '#0D2B4E' }}>{title}</p>
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

      {open && (
        <div
          className="flex flex-col gap-3 px-4 pb-4"
          style={{ borderTop: '1px solid #E2E8F0' }}
          onClick={e => e.stopPropagation()}
        >
          <p className="leading-relaxed pt-3" style={{ fontSize: 13, color: '#374151' }}>{body}</p>

          <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: infoBarBg }}>
            <p className="font-semibold" style={{ fontSize: 12.5, color: infoBarColor }}>{infoBarText}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {chips.map((chip, i) => (
              <PolicyClientChip key={i} label={chip} bgColor={chipColor} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              className="flex-1 py-2.5 rounded-xl text-center transition-all active:scale-95"
              style={{ fontSize: 12, fontWeight: 700, backgroundColor: '#FFFFFF', color: '#0D2B4E', border: '1.5px solid #CBD5E0' }}
            >
              Review Affected Clients
            </button>
            <button
              onClick={onSendCommunication}
              className="flex-1 py-2.5 rounded-xl text-center transition-all active:scale-95"
              style={{ fontSize: 12, fontWeight: 700, backgroundColor: '#1B9AAA', color: '#FFFFFF' }}
            >
              Send Client Communication
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CommunicationModal({ onClose, onSend }) {
  const [draft, setDraft] = useState(COMMUNICATION_DRAFT)
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
        <div className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: '1px solid #E2E8F0' }}>
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: '#0D2B4E' }}>Draft Client Communication</h2>
            <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>
              Sending to 3 affected clients · From: Maimone Legal
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

        <div className="flex flex-col gap-3 px-5 pt-4 pb-8">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={14}
            className="w-full px-3 py-3 rounded-xl text-sm outline-none"
            style={{ border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E', resize: 'vertical', lineHeight: 1.5 }}
          />
          <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
            MigraTrak drafted this message based on the policy update. Review and edit before sending. This will be sent from your practice email to 3 affected clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#F1F5F9', color: '#0D2B4E' }}
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#1B9AAA', color: '#FFFFFF' }}
            >
              Send to 3 Clients →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PolicyIntelligence({ onShowToast }) {
  const [showModal, setShowModal] = useState(false)
  const todayLabel = new Date().toLocaleDateString()

  function handleSend() {
    setShowModal(false)
    onShowToast()
  }

  return (
    <div className="flex flex-col gap-3">
      {showModal && <CommunicationModal onClose={() => setShowModal(false)} onSend={handleSend} />}

      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-extrabold uppercase tracking-[0.16em]" style={{ fontSize: 13, color: '#0D2B4E' }}>
          Policy Intelligence — Updated Today
        </p>
        <span
          className="px-2.5 py-1 rounded-full font-bold"
          style={{ fontSize: 11, backgroundColor: '#1B9AAA', color: '#FFFFFF' }}
        >
          {todayLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#1A7A4A' }} />
          <span className="text-xs font-bold" style={{ color: '#1A7A4A' }}>LIVE</span>
        </div>
      </div>

      <PolicyCard
        defaultOpen={true}
        borderColor="#DC2626"
        badgeBg="#FEE2E2"
        badgeColor="#B91C1C"
        badgeLabel="HIGH PRIORITY"
        title="Adjustment of Status — Major Policy Shift"
        date="June 5, 2026"
        body={`USCIS now requires "extraordinary circumstances" for I-485 Adjustment of Status approval. H-1B and L-1 holders are largely exempt due to dual intent rules. All other visa holders pursuing a green card through adjustment may face increased scrutiny or denial.`}
        infoBarBg="#E0F7FA"
        infoBarColor="#0E7490"
        infoBarText="3 of your active clients may be affected"
        chips={['Sarah Whitfield · EB-5 · I-485 pending · HIGH', 'Marcus Webb · E-2 · Green card path · REVIEW', 'Alex Moreau · K-1 · Adjustment pending · REVIEW']}
        chipColor="#1B9AAA"
        onSendCommunication={() => setShowModal(true)}
      />

      <PolicyCard
        defaultOpen={false}
        borderColor="#D97706"
        badgeBg="#FEF3C7"
        badgeColor="#92400E"
        badgeLabel="INFORMATIONAL"
        title="H-1B Social Media Vetting — New USCIS Requirement"
        date="April 9, 2026"
        body="USCIS is now considering social media activity as grounds for denying immigration benefits. H-1B clients should audit public-facing accounts before upcoming applications or renewals."
        infoBarBg="#FEF3C7"
        infoBarColor="#92400E"
        infoBarText="2 of your H-1B clients should be informed"
        chips={['Daniel Reyes · H-1B · Active · INFORM', 'Jordan Patel · H-1B dependent · INFORM']}
        chipColor="#D97706"
        onSendCommunication={onShowToast}
      />
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function A1AttorneyDashboard() {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const [clients, setClients]     = useState(null)
  const [metrics, setMetrics]     = useState(null)
  const [attorneyId, setAttorneyId]       = useState(null)
  const [attorneyProfile, setAttorneyProfile] = useState(null)
  const [toast, setToast] = useState(null)

  function showCommunicationToast() {
    setToast('Communication queued — no actual email sent in demo mode.')
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      setAttorneyId(session.user.id)
      fetch('/api/get-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attorneyId: session.user.id }),
      })
        .then(r => r.json())
        .then(data => {
          setClients(data.clients || [])
          if (data.metrics) setMetrics(data.metrics)
        })
        .catch(() => {})
      supabase.from('users').select('name, firm_name, zapier_webhook_url').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setAttorneyProfile(data) })
    })
  }, [])

  return (
    <>
      {showModal && <AddClientModal onClose={() => setShowModal(false)} attorneyProfile={attorneyProfile} />}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 px-4 py-3 rounded-2xl shadow-lg"
          style={{ transform: 'translateX(-50%)', backgroundColor: '#0D2B4E', maxWidth: '90vw' }}
        >
          <p className="text-sm font-semibold text-center" style={{ color: '#FFFFFF' }}>{toast}</p>
        </div>
      )}

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
                onClick={() => navigate('/a-billing')}
                className="transition-opacity active:opacity-60"
                style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Billing
              </button>
              <button
                onClick={async () => { await supabase.auth.signOut(); navigate('/') }}
                className="transition-opacity active:opacity-60"
                style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Sign out
              </button>
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
          <MorningBriefing clients={clients} />

          {/* Policy Intelligence */}
          <PolicyIntelligence onShowToast={showCommunicationToast} />

          {clients && clients.length > 0 && <CheckinPreview client={clients[0]} />}

          {/* Consultation Queue */}
          <ConsultationQueue attorneyId={attorneyId} />
          <ZapierSetup attorneyId={attorneyId} attorneyProfile={attorneyProfile} onSaved={(url) => setAttorneyProfile(p => ({ ...p, zapier_webhook_url: url }))} />


          {/* Monthly metrics */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <p className="text-xs font-extrabold uppercase tracking-widest px-4 pt-4 pb-3" style={{ color: '#4A5568' }}>
              This Month
            </p>
            <div className="grid grid-cols-2 divide-x divide-y" style={{ borderColor: '#F1F5F9' }}>
              {[
                { label: 'New clients',          value: metrics ? String(metrics.newClients)          : '—' },
                { label: 'Milestones completed', value: metrics ? String(metrics.milestonesCompleted) : '—' },
                { label: 'Avg progress',         value: metrics ? `${metrics.avgProgress}%`           : '—' },
                { label: 'Docs flagged',         value: metrics ? String(metrics.docsFlagged)         : '—' },
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
