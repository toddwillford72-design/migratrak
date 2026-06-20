import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MILESTONE_TEMPLATES } from '../data/config'

// ── Essentials checklist helpers (mirrors J6Essentials) ────────────────────────
function loadAnswers() {
  try { return JSON.parse(localStorage.getItem('migratrak_answers') || '{}') } catch { return {} }
}
function hasChildren(a) {
  return a.household === 'Me, spouse, and children' || (typeof a.children === 'string' && a.children.startsWith('Yes'))
}
const ESSENTIALS_TOTAL_NO_CHILDREN = 38
const ESSENTIALS_TOTAL_WITH_CHILDREN = 43
// Item IDs shown in the dashboard preview row
const PREVIEW_ITEM_IDS = { accountant: 's1_02', health: 's3_01', auto: 's5_01' }

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',  path: '/j1' },
  { id: 'expenses',   label: 'Expenses',   path: '/j2' },
  { id: 'documents',  label: 'Documents',  path: '/j3' },
  { id: 'coach',      label: 'AI Coach',   path: '/j4' },
  { id: 'directory',  label: 'Directory',  path: '/j5' },
  { id: 'essentials', label: 'Essentials', path: '/j6' },
  { id: 'resources', label: 'Resources', path: '/resources' },
]

const PHASES = [
  'Preparation',
  'Filing',
  'Documentation',
  'USCIS Processing',
  'Approval & Entry',
  'Residency',
]


const CHECKLIST_PREVIEW_REAL = [
  { id: 'auto',      essId: PREVIEW_ITEM_IDS.auto,       label: 'Auto insurance',           note: 'Confirm before the 6-month mark',  urgency: 'amber' },
  { id: 'accountant',essId: PREVIEW_ITEM_IDS.accountant, label: 'Cross-border accountant',  note: 'Not engaged yet',                   urgency: 'amber' },
  { id: 'health',    essId: PREVIEW_ITEM_IDS.health,     label: 'US health insurance',      note: 'Not enrolled',                      urgency: 'amber' },
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

// ── Follow-up banner ──────────────────────────────────────────────────────────
function FollowupBanner({ prospect, step, onContactMethod, onResponse, onDismiss }) {
  const name = prospect.professional_name || 'the attorney'
  if (step === 1) {
    return (
      <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}>
        <div>
          <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>Following up — {name}</p>
          <p className="text-sm mt-1" style={{ color: '#1B5FA8' }}>How did you reach out to {name}?</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onContactMethod('phone')}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#0D2B4E', color: '#FFFFFF' }}
          >📞 Phone</button>
          <button
            onClick={() => onContactMethod('email')}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#0D2B4E', color: '#FFFFFF' }}
          >✉️ Email</button>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs font-semibold py-1"
          style={{ color: '#94A3B8' }}
        >Not yet — remind me later</button>
      </div>
    )
  }
  return (
    <div className="rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}>
      <div>
        <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>Did you connect with {name}?</p>
        <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>Tap to update your intro status</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onResponse('yes')}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#1A7A4A', color: '#FFFFFF' }}
        >✓ Yes</button>
        <button
          onClick={() => onResponse('not_yet')}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#F1F5F9', color: '#4A5568' }}
        >Not yet</button>
        <button
          onClick={() => onResponse('no')}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
        >No</button>
      </div>
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
function MilestoneRow({ milestone, isLast, onClick }) {
  const isDone   = milestone.status === 'done'
  const isActive = milestone.status === 'active'

  return (
    <div
      className="flex gap-3"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
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
function ChecklistItem({ item, completed }) {
  const isRed = item.urgency === 'red'
  if (completed) {
    return (
      <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1A7A4A' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <p className="text-sm font-semibold line-through" style={{ color: '#A0AEC0' }}>{item.label}</p>
      </div>
    )
  }
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

const VISA_LABELS = {
  eb5: 'EB-5 Investor', e2: 'E-2 Treaty Investor', tn: 'TN Visa',
  l1: 'L-1 Transfer', h1b: 'H-1B', o1: 'O-1', k1: 'K-1 Fiancé(e)', eb2niw: 'EB-2 NIW',
}

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function EmptyMilestones() {
  return (
    <div className="rounded-2xl px-5 py-8 flex flex-col items-center text-center gap-3"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B5FA8" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
        </svg>
      </div>
      <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>No milestones yet</p>
      <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>
        Your journey milestones will appear here once your attorney activates your account.
      </p>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function J1Dashboard() {
  const navigate = useNavigate()
  const [legalBannerDismissed, setLegalBannerDismissed] = useState(() => {
    try { return localStorage.getItem('migratrak_legal_banner_dismissed') === 'true' } catch { return false }
  })

  function dismissLegalBanner() {
    try { localStorage.setItem('migratrak_legal_banner_dismissed', 'true') } catch {}
    setLegalBannerDismissed(true)
  }

  const [profile, setProfile] = useState(null)       // null = loading, false = no session (demo)
  const [attorney, setAttorney] = useState(null)
  const [essentialsDoneIds, setEssentialsDoneIds] = useState(new Set())
  const [milestones, setMilestones] = useState(null) // null = loading
  const [confirmModal, setConfirmModal] = useState(null) // { id, title }
  const [saving, setSaving] = useState(false)
  const [dismissedAlertIds, setDismissedAlertIds] = useState([])
  const [staleProspect, setStaleProspect] = useState(null)
  const [followupStep, setFollowupStep] = useState(1)
  const [followupContact, setFollowupContact] = useState(null)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  async function handleLogout() {
    try {
      localStorage.removeItem('migratrak_answers')
      localStorage.removeItem('migratrak_visa')
      localStorage.removeItem('migratrak_destination')
      localStorage.removeItem('migratrak_legal_banner_dismissed')
    } catch {}
    await supabase.auth.signOut()
    navigate('/')
  }

  async function seedMilestones(userId, visaType) {
    const key = (visaType || '').toLowerCase().replace(/[-\s]/g, '')
    const templates = MILESTONE_TEMPLATES[key]
    if (!templates || templates.length === 0) return []
    const rows = templates.map((t, i) => ({ user_id: userId, title: t.title, phase: t.phase, status: 'upcoming', sort_order: i + 1 }))
    const { data } = await supabase.from('milestones').insert(rows).select()
    return data || []
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      if (!user) { setProfile(false); setMilestones([]); return }
      const userId = user.id
      const [{ data: userRow }, { data: mRows }, { data: eRows }] = await Promise.all([
        supabase.from('users').select('name, visa_type, role, case_start_date').eq('id', userId).single(),
        supabase.from('milestones').select('*').eq('user_id', userId).order('sort_order'),
        supabase.from('essentials_progress').select('item_id').eq('user_id', userId).eq('completed', true),
      ])
      setEssentialsDoneIds(new Set((eRows || []).map((r) => r.item_id)))
      const displayName = userRow?.name || user.user_metadata?.name || null
      setProfile({ ...(userRow || {}), name: displayName, email: user.email, visa_type: userRow?.visa_type ?? null })

      // Fetch attorney info and check first-login password prompt
      try {
        const { data: linkData } = await supabase
          .from('attorney_clients')
          .select('attorney_id')
          .eq('client_id', userId)
          .maybeSingle()

        if (linkData?.attorney_id) {
          const { data: attData } = await supabase
            .from('users')
            .select('name, firm_name')
            .eq('id', linkData.attorney_id)
            .maybeSingle()

          if (attData) setAttorney(attData)

          const hasChangedPassword = localStorage.getItem(
            `migratrak_password_changed_${userId}`
          )
          if (!hasChangedPassword) {
            setShowPasswordPrompt(true)
          }
        }
      } catch {
        // attorney display is non-critical, fail silently
      }

      if ((mRows || []).length === 0 && userRow?.visa_type) {
        const seeded = await seedMilestones(userId, userRow.visa_type)
        const sorted = [...seeded].sort((a, b) => a.phase - b.phase)
        setMilestones(sorted)
      } else {
        setMilestones(mRows || [])
      }

      // Check for stale intro-sent prospects (72h+ old, followup_count < 2)
      try {
        const queue = JSON.parse(localStorage.getItem('migratrak_intro_queue') || '[]')
        const cutoff = Date.now() - 72 * 60 * 60 * 1000
        const stale = queue.find(item =>
          item.intro_sent_at &&
          new Date(item.intro_sent_at).getTime() < cutoff &&
          (item.followup_count || 0) < 2
        )
        if (stale) setStaleProspect(stale)
      } catch {}
    })
  }, [])

  async function handleMarkComplete(milestone) {
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    const isComplete = milestone.status === 'complete'
    const newStatus = isComplete ? 'upcoming' : 'complete'
    const newDate = isComplete ? null : today
    const updated = milestones.map((m) =>
      m.id === milestone.id ? { ...m, status: newStatus, completed_date: newDate } : m
    )
    setMilestones(updated)
    setConfirmModal(null)
    await supabase.from('milestones').update({ status: newStatus, completed_date: newDate }).eq('id', milestone.id)
    setSaving(false)
  }

  async function handleSetPassword() {
    setPasswordError(null)
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    setPasswordSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        localStorage.setItem(`migratrak_password_changed_${user.id}`, 'true')
      }
      setPasswordSuccess(true)
      setTimeout(() => {
        setShowPasswordPrompt(false)
        setPasswordSuccess(false)
        setNewPassword('')
        setConfirmPassword('')
      }, 2000)
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setPasswordSaving(false)
    }
  }

  function handleSkipPassword() {
    const userId = profile?.id
    if (userId) localStorage.setItem(`migratrak_password_changed_${userId}`, 'true')
    setShowPasswordPrompt(false)
  }

  const essentialsTotal = hasChildren(loadAnswers()) ? ESSENTIALS_TOTAL_WITH_CHILDREN : ESSENTIALS_TOTAL_NO_CHILDREN
  const essentialsDone  = essentialsDoneIds.size
  const essentialsPct   = Math.round((essentialsDone / essentialsTotal) * 100)

  const isCanada = (() => {
    try {
      const saved = localStorage.getItem('migratrak_answers')
      if (!saved) return true
      return JSON.parse(saved)?.country === 'Canada'
    } catch { return true }
  })()

  const [menuOpen, setMenuOpen] = useState(false)

  // Compute progress from real data
  const { progressPct, completedPhases } = useMemo(() => {
    if (!milestones || milestones.length === 0) {
      return { progressPct: 0, completedPhases: 0 }
    }
    const total = milestones.length
    const complete = milestones.filter((m) => m.status === 'complete').length
    const pct = total > 0 ? Math.round((complete / total) * 100) : 0
    const filled = Math.round((complete / total) * PHASES.length)
    return { progressPct: pct, completedPhases: filled }
  }, [milestones])

  // Compute data-driven alerts
  const computedAlerts = useMemo(() => {
    if (!milestones || !profile) return []
    const today = new Date()
    const caseStart = profile.case_start_date ? new Date(profile.case_start_date) : null
    const daysSinceStart = caseStart ? Math.floor((today - caseStart) / (1000 * 60 * 60 * 24)) : null
    const monthsSinceStart = daysSinceStart !== null ? daysSinceStart / 30 : null

    const alerts = []

    // SSN alert
    const ssnMilestone = milestones.find((m) => m.title?.toLowerCase().includes('ssn'))
    if (ssnMilestone && ssnMilestone.status !== 'complete' && daysSinceStart !== null && daysSinceStart > 30) {
      alerts.push({
        id: 'ssn',
        title: 'SSN Follow-Up Needed',
        body: 'Your SSN milestone is not yet complete. Call the Social Security Administration to confirm no documentation issues — errors can go undetected for months and affect healthcare and employment eligibility.',
        urgent: false,
        actions: [
          { label: 'Mark done', onPress: () => setConfirmModal(ssnMilestone) },
          { label: 'Dismiss' },
        ],
      })
    }

    // Auto insurance alert
    const insuranceMilestone = milestones.find((m) => m.title?.toLowerCase().includes('auto insurance') || m.title?.toLowerCase().includes('us auto'))
    const insuranceDone = insuranceMilestone?.status === 'complete'
    if (!insuranceDone && monthsSinceStart !== null && monthsSinceStart > 5) {
      alerts.push({
        id: 'auto-insurance',
        title: isCanada ? 'Auto Insurance — Act Now' : 'Auto Insurance — Confirm Your Coverage',
        body: isCanada
          ? 'You have been in the US for over 5 months. Canadian auto insurance typically voids at 6 months on Canadian-registered vehicles. Arrange US coverage this week.'
          : 'Confirm whether your home country auto insurance policy remains valid in the US and for how long. Coverage often voids sooner than expected. Arrange US coverage before any gap occurs.',
        urgent: true,
        actions: [
          { label: 'Find insurance →', onPress: () => navigate('/j6') },
          { label: 'Dismiss' },
        ],
      })
    }

    // Overdue alerts
    milestones.forEach((m) => {
      if (m.status !== 'complete' && m.due_date) {
        const due = new Date(m.due_date)
        if (due < today) {
          alerts.push({
            id: `overdue-${m.id}`,
            title: `Overdue: ${m.title}`,
            body: `This milestone was due ${due.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} and is not yet complete.`,
            urgent: true,
            actions: [
              { label: 'Mark done', onPress: () => setConfirmModal(m) },
              { label: 'Dismiss' },
            ],
          })
        }
      }
    })

    return alerts
  }, [milestones, profile, isCanada])

  const activeAlerts = computedAlerts.filter((a) => !dismissedAlertIds.includes(a.id))

  function dismissAlert(id) {
    setDismissedAlertIds((prev) => [...prev, id])
  }

  function updateIntroQueue(prospectId, updates) {
    try {
      const queue = JSON.parse(localStorage.getItem('migratrak_intro_queue') || '[]')
      localStorage.setItem('migratrak_intro_queue', JSON.stringify(
        queue.map(item => item.id === prospectId ? { ...item, ...updates } : item)
      ))
    } catch {}
  }

  function handleFollowupContactMethod(method) {
    setFollowupContact(method)
    updateIntroQueue(staleProspect.id, { contact_method: method })
    try { supabase.from('prospects').update({ contact_method: method }).eq('id', staleProspect.id) } catch {}
    setFollowupStep(2)
  }

  function handleFollowupResponse(response) {
    if (response === 'yes') {
      updateIntroQueue(staleProspect.id, { status: 'consultation_confirmed' })
      try { supabase.from('prospects').update({ intro_status: 'consultation_confirmed' }).eq('id', staleProspect.id) } catch {}
    } else if (response === 'no') {
      const newCount = (staleProspect.followup_count || 0) + 1
      updateIntroQueue(staleProspect.id, { followup_count: newCount, status: newCount >= 2 ? 'no_response' : undefined })
      try { supabase.from('prospects').update({ intro_status: 'no_response', followup_count: newCount }).eq('id', staleProspect.id) } catch {}
    }
    // 'not_yet' or after any final response — clear banner
    setStaleProspect(null)
    setFollowupStep(1)
    setFollowupContact(null)
  }

  function handleFollowupDismiss() {
    setStaleProspect(null)
    setFollowupStep(1)
    setFollowupContact(null)
  }

  // Map DB row to display shape for MilestoneRow
  function rowToDisplay(m) {
    const statusMap = { complete: 'done', in_progress: 'active', upcoming: 'upcoming' }
    return {
      id: m.id,
      label: m.title,
      status: statusMap[m.status] ?? 'upcoming',
      date: m.completed_date || m.due_date || null,
      raw: m,
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Dismissable legal disclaimer banner */}
      {!legalBannerDismissed && (
        <div className="px-4 py-3 flex items-start gap-3" style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <p className="flex-1 text-xs leading-relaxed" style={{ color: '#64748B' }}>
            MigraTrak tracks your journey and provides educational guidance — it is not a substitute for qualified legal counsel. Your attorney makes all legal decisions.
          </p>
          <button
            onClick={dismissLegalBanner}
            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity active:opacity-60"
            style={{ backgroundColor: '#E2E8F0', color: '#475569' }}
          >
            Got it
          </button>
        </div>
      )}

      {/* Attorney intro follow-up banner */}
      {staleProspect && (
        <div className="px-4 pt-3">
          <FollowupBanner
            prospect={staleProspect}
            step={followupStep}
            onContactMethod={handleFollowupContactMethod}
            onResponse={handleFollowupResponse}
            onDismiss={handleFollowupDismiss}
          />
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        {/* Top bar: wordmark + profile icon */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#4A9FD4' }}>
            MigraTrak
          </span>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity active:opacity-80 flex-shrink-0"
              style={{ backgroundColor: '#0D2B4E', border: '2px solid rgba(255,255,255,0.25)' }}
              aria-label="Profile menu"
            >
              <span className="text-xs font-extrabold" style={{ color: '#FFFFFF' }}>
                {initials(profile?.name)}
              </span>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-11 z-50 rounded-xl flex flex-col"
                style={{ backgroundColor: '#FFFFFF', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid #E2E8F0', minWidth: 240 }}
                onClick={e => e.stopPropagation()}
              >
                {/* User info */}
                <div className="px-4 py-3 border-b" style={{ borderColor: '#E2E8F0' }}>
                  <p className="text-sm font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>
                    {profile?.name || '—'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                    {profile?.email || ''}
                  </p>
                  {profile?.visa_type && (
                    <p className="text-xs mt-0.5 font-medium" style={{ color: '#4A9FD4' }}>
                      {VISA_LABELS[profile.visa_type] ?? profile.visa_type}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1A7A4A' }} />
                    <span className="text-xs font-semibold" style={{ color: '#1A7A4A' }}>Active</span>
                  </div>
                </div>
                {/* Menu rows */}
                <a
                  href="https://egov.uscis.gov/casestatus/landing.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 transition-colors active:bg-gray-50"
                  style={{ minHeight: 44, color: '#0D2B4E', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" />
                    <path d="M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="text-sm font-medium">USCIS Status</span>
                </a>
                <button
                  onClick={() => { navigate('/j4'); setMenuOpen(false) }}
                  className="flex items-center gap-3 px-4 text-left transition-colors active:bg-gray-50"
                  style={{ minHeight: 44, color: '#0D2B4E', borderBottom: '1px solid #F1F5F9' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  <span className="text-sm font-medium">Help</span>
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 text-left transition-colors active:bg-gray-50"
                  style={{ minHeight: 44, color: '#0D2B4E', borderBottom: '1px solid #E2E8F0' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M1 12h2m18 0h2M12 1v2m0 18v2" />
                  </svg>
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <div className="px-4 py-3 flex gap-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <button
                    onClick={() => { navigate('/terms'); setMenuOpen(false) }}
                    className="text-xs underline"
                    style={{ color: '#94A3B8' }}
                  >
                    Terms of Service
                  </button>
                  <span className="text-xs" style={{ color: '#E2E8F0' }}>|</span>
                  <button
                    onClick={() => { navigate('/privacy'); setMenuOpen(false) }}
                    className="text-xs underline"
                    style={{ color: '#94A3B8' }}
                  >
                    Privacy Policy
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 text-left transition-colors active:bg-gray-50 rounded-b-xl"
                  style={{ minHeight: 44, color: '#DC2626' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="text-sm font-semibold">Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User identity row */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#1B5FA8' }}
          >
            <span className="text-sm font-extrabold" style={{ color: '#FFFFFF' }}>
              {initials(profile?.name)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest truncate" style={{ color: '#4A9FD4' }}>
              {profile?.visa_type ? VISA_LABELS[profile.visa_type] ?? profile.visa_type : 'Immigration journey'}
            </p>
            <h1 className="text-xl font-extrabold truncate" style={{ color: '#FFFFFF' }}>
              {profile?.name || '—'}
            </h1>
            {attorney && (
              <p style={{ color: '#4A9FD4', fontSize: '13px', marginTop: '4px' }}>
                Attorney: {attorney.firm_name || attorney.name}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Overall Progress
            </span>
            <span className="text-sm font-extrabold" style={{ color: '#F0A500' }}>{progressPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div className="h-2 rounded-full" style={{ width: `${progressPct}%`, backgroundColor: '#F0A500' }} />
          </div>
          <div className="flex justify-between mt-2">
            {PHASES.map((_, i) => (
              <div key={i} className="h-1 rounded-full flex-1 mx-0.5"
                style={{ backgroundColor: i < completedPhases ? '#4A9FD4' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* View switcher tab bar */}
      <div
        className="flex gap-2"
        style={{ backgroundColor: '#0D2B4E', paddingBottom: 12, paddingLeft: 16, paddingRight: 16, paddingTop: 8 }}
      >
        <button
          className="px-5 py-2 rounded-full text-sm font-bold"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
        >
          My Case
        </button>
        <button
          onClick={() => navigate('/resources')}
          className="px-5 py-2 rounded-full text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: 'transparent', color: 'rgba(255,255,255,0.6)' }}
        >
          Resources
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">

        {/* Urgent alerts */}
        {activeAlerts.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#DC2626' }}>
              🚨 Action Required
            </p>
            {activeAlerts.map((alert) => (
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
        {milestones === null ? (
          <div className="rounded-2xl px-5 py-5 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <p className="text-sm" style={{ color: '#4A5568' }}>Loading milestones…</p>
          </div>
        ) : milestones.length === 0 ? (
          <EmptyMilestones />
        ) : (
          <div className="rounded-2xl px-5 py-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <p className="text-xs font-extrabold uppercase tracking-widest mb-4" style={{ color: '#4A5568' }}>
              Case Milestones
            </p>
            {milestones.map((m, i) => {
              const display = rowToDisplay(m)
              return (
                <MilestoneRow
                  key={m.id}
                  milestone={display}
                  isLast={i === milestones.length - 1}
                  onClick={() => setConfirmModal(m)}
                />
              )
            })}
          </div>
        )}

        {/* Life setup checklist preview */}
        <div className="rounded-2xl px-5 py-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>Life Setup Checklist</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
              {essentialsDone} / {essentialsTotal}
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: '#4A5568' }}>
            Things people forget — until it's too late
          </p>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full mb-4" style={{ backgroundColor: '#F1F5F9' }}>
            <div className="h-1.5 rounded-full" style={{ width: `${essentialsPct}%`, backgroundColor: '#F0A500' }} />
          </div>
          {CHECKLIST_PREVIEW_REAL.map((item) => (
            <ChecklistItem key={item.id} item={item} completed={essentialsDoneIds.has(item.essId)} />
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

      {/* Backdrop to close dropdown */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mark complete modal */}
      {confirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl px-6 py-6 flex flex-col gap-4"
            style={{ backgroundColor: '#FFFFFF' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <p className="text-base font-extrabold" style={{ color: '#0D2B4E' }}>
                {confirmModal.status === 'complete' ? 'Mark as incomplete?' : 'Mark as complete?'}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>
                "{confirmModal.title}"
              </p>
            </div>
            {confirmModal.status !== 'complete' && (
              <p className="text-sm font-semibold" style={{ color: '#4A9FD4' }}>
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ backgroundColor: '#F1F5F9', color: '#475569' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkComplete(confirmModal)}
                disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: confirmModal.status === 'complete' ? '#64748B' : '#1A7A4A',
                  color: '#FFFFFF',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Saving…' : confirmModal.status === 'complete' ? 'Uncheck' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First-login password change prompt */}
      {showPasswordPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl px-6 py-6 flex flex-col gap-4"
            style={{ backgroundColor: '#FFFFFF' }}
            onClick={e => e.stopPropagation()}
          >
            {passwordSuccess ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#D1FAE5' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#1A7A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-base font-extrabold text-center" style={{ color: '#0D2B4E' }}>Password updated successfully!</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-extrabold" style={{ color: '#0D2B4E' }}>Welcome to MigraTrak</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>Please set a new password for your account.</p>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-3 rounded-xl text-sm outline-none"
                    style={{ height: 44, border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
                    onFocus={e => e.target.style.borderColor = '#1B5FA8'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 rounded-xl text-sm outline-none"
                    style={{ height: 44, border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
                    onFocus={e => e.target.style.borderColor = '#1B5FA8'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                  {passwordError && (
                    <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>{passwordError}</p>
                  )}
                </div>

                <button
                  onClick={handleSetPassword}
                  disabled={passwordSaving}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{ backgroundColor: passwordSaving ? '#94A3B8' : '#1B9AAA', color: '#FFFFFF', opacity: passwordSaving ? 0.7 : 1 }}
                >
                  {passwordSaving ? 'Updating…' : 'Set Password'}
                </button>

                <button
                  onClick={handleSkipPassword}
                  className="w-full text-center text-sm transition-opacity active:opacity-60"
                  style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Skip for now
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
