import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const VISA_LABELS = {
  eb5: 'EB-5 Investor', e2: 'E-2 Treaty Investor', tn: 'TN Visa',
  l1: 'L-1 Transfer', h1b: 'H-1B', o1: 'O-1', k1: 'K-1 Fiancé(e)', eb2niw: 'EB-2 NIW',
}

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

function AutoInsuranceScreen({ onBack, destination }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 mb-3 transition-opacity active:opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Back to Essentials</span>
        </button>
        <h1 className="text-xl font-extrabold" style={{ color: '#FFFFFF' }}>Auto Insurance{destination ? ` — ${destination}` : ''}</h1>
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

function ChecklistItem({ id, label, actionLabel, onAction, onLearnMore, urgencyNote, last, completed, onToggle }) {
  const effectiveAction = onAction && onAction.toString() !== '() => {}' ? onAction : onLearnMore
  const isUrgent = !!urgencyNote && !completed
  return (
    <div className="py-2.5 flex flex-col gap-1.5"
      style={{ borderBottom: last ? 'none' : '1px solid #F1F5F9' }}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(id)} aria-label="Toggle complete"
          className="flex-shrink-0 mt-0.5 transition-transform active:scale-90">
          {completed ? (
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1A7A4A' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          ) : isUrgent ? (
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', border: '2px solid #DC2626' }}>
              <span className="text-xs font-bold" style={{ color: '#DC2626' }}>!</span>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: '#CBD5E0' }} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm" style={{
            color: completed ? '#A0AEC0' : (isUrgent ? '#991B1B' : '#0D2B4E'),
            fontWeight: isUrgent ? '700' : '400',
            textDecoration: completed ? 'line-through' : 'none',
          }}>
            {label}
          </p>
          {urgencyNote && !completed && (
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#DC2626' }}>{urgencyNote}</p>
          )}
        </div>
      </div>
      {actionLabel && !completed && (
        <div className="pl-9">
          <button onClick={effectiveAction}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={isUrgent
              ? { backgroundColor: '#DC2626', color: '#FFFFFF' }
              : { backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}>
            {actionLabel}
          </button>
        </div>
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
  const [profile,  setProfile]  = useState(null) // null = loading, false = no session (demo)
  const [completedIds, setCompletedIds] = useState(new Set())
  const [saveError, setSaveError] = useState(null)
  const onLearnMore = () => navigate('/j4')

  useEffect(() => { setAnswers(loadAnswers()) }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      if (!user) {
        setProfile(false)
        setCompletedIds(new Set())
        return
      }
      const [{ data: userRow }, { data: progressRows }] = await Promise.all([
        supabase.from('users').select('name, visa_type').eq('id', user.id).single(),
        supabase.from('essentials_progress').select('item_id').eq('user_id', user.id).eq('completed', true),
      ])
      const displayName = userRow?.name || user.user_metadata?.name || user.email
      setProfile({ name: displayName, visa_type: userRow?.visa_type ?? null })
      setCompletedIds(new Set((progressRows || []).map((r) => r.item_id)))
    })
  }, [])

  async function toggleItem(id) {
    const wasCompleted = completedIds.has(id)
    const next = new Set(completedIds)
    if (wasCompleted) next.delete(id); else next.add(id)
    setCompletedIds(next)

    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) {
      setCompletedIds(completedIds) // revert
      setSaveError('Not signed in — your progress on this item was not saved.')
      return
    }

    const { error } = await supabase.from('essentials_progress').upsert({
      user_id: userId,
      item_id: id,
      completed: !wasCompleted,
      completed_date: !wasCompleted ? new Date().toISOString().split('T')[0] : null,
    }, { onConflict: 'user_id,item_id' })

    if (error) {
      console.error('Failed to save essentials progress', error)
      setCompletedIds(completedIds) // revert optimistic update
      setSaveError(`Couldn't save — ${error.message || 'please try again'}`)
    } else {
      setSaveError(null)
    }
  }

  const withChildren = hasChildren(answers)
  const withAgeOut   = hasAgeOutChildren(answers)

  // All 6 sections start expanded
  const [open, setOpen] = useState({ s1: true, s2: true, s3: true, s4: true, s5: true, s6: true })
  const toggle = (k) => setOpen(prev => ({ ...prev, [k]: !prev[k] }))

  // Category sub-screens
  if (category === 'auto-insurance') return <AutoInsuranceScreen onBack={() => setCategory(null)} destination={answers.destination} />
  if (category === 'banking')        return <BankingScreen        onBack={() => setCategory(null)} />

  // Item IDs per section — drives both rendering (completed state) and the
  // header/section progress counts. Conditional items (children, age-out)
  // are still given stable IDs even when not shown for this user.
  const S1_IDS = ['s1_01','s1_02','s1_03','s1_04','s1_05','s1_06','s1_07','s1_08', ...(withChildren ? ['s1_09','s1_10'] : []), 's1_11']
  const S2_IDS = ['s2_01','s2_02','s2_03','s2_04','s2_05','s2_06','s2_07','s2_08']
  const S3_IDS = ['s3_01','s3_02','s3_03','s3_04','s3_05','s3_06', ...(withChildren ? ['s3_07','s3_08'] : []), 's3_09']
  const S4_IDS = ['s4_01','s4_02','s4_03','s4_04','s4_05', ...(withChildren ? ['s4_06'] : [])]
  const S5_IDS = ['s5_01','s5_02','s5_03','s5_04']
  const S6_IDS = ['s6_01','s6_02','s6_03','s6_04','s6_05']

  const countDone = (ids) => ids.filter((id) => completedIds.has(id)).length

  const s1Done = countDone(S1_IDS), s1Total = S1_IDS.length
  const s2Done = countDone(S2_IDS), s2Total = S2_IDS.length
  const s3Done = countDone(S3_IDS), s3Total = S3_IDS.length
  const s4Done = countDone(S4_IDS), s4Total = S4_IDS.length
  const s5Done = countDone(S5_IDS), s5Total = S5_IDS.length
  const s6Done = countDone(S6_IDS), s6Total = S6_IDS.length
  const totalDone  = s1Done + s2Done + s3Done + s4Done + s5Done + s6Done
  const totalItems = s1Total + s2Total + s3Total + s4Total + s5Total + s6Total
  const pct = Math.round((totalDone / totalItems) * 100)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          Life Setup Checklist
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>Essentials</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {answers.destination ? `Setting up your life in ${answers.destination}` : 'Setting up your American life'}
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

      {saveError && (
        <div className="mx-4 mt-4 px-4 py-3 rounded-xl flex items-start gap-2" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
          <span className="text-sm flex-shrink-0">⚠️</span>
          <p className="text-xs leading-relaxed" style={{ color: '#991B1B' }}>{saveError}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 pt-4 pb-40">

        {/* ── SECTION 1: BEFORE YOU ARRIVE ── */}
        <Section title="Before You Arrive" subtitle="Do these before leaving your home country"
          open={open.s1} onToggle={() => toggle('s1')} doneCount={s1Done} totalCount={s1Total}>
          <div className="pt-1">
            <ChecklistItem id="s1_01" completed={completedIds.has('s1_01')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Sell or transfer your TFSA before becoming a US tax resident" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s1_02" completed={completedIds.has('s1_02')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Engage cross-border accountant" actionLabel="Find one" onAction={() => navigate('/j5')} />
            <ChecklistItem id="s1_03" completed={completedIds.has('s1_03')} onToggle={toggleItem} onLearnMore={onLearnMore} label="File home country departure return" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s1_04" completed={completedIds.has('s1_04')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Cancel or update provincial health coverage (e.g. OHIP)" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s1_05" completed={completedIds.has('s1_05')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Review which home country accounts to keep vs. close (RRSP can stay — treaty protected)" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s1_06" completed={completedIds.has('s1_06')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Obtain medical records from home country doctors" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s1_07" completed={completedIds.has('s1_07')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Arrange pet relocation — vaccinations and health certificate" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s1_08" completed={completedIds.has('s1_08')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Set up mail forwarding with Canada Post" actionLabel="Learn more" onAction={() => {}} />
            {withChildren && (
              <>
                <ChecklistItem id="s1_09" completed={completedIds.has('s1_09')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Request school transcripts from home country" actionLabel="Learn how" onAction={() => {}} />
                <ChecklistItem id="s1_10" completed={completedIds.has('s1_10')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Obtain immunization records from home country" actionLabel="Check requirements" onAction={() => {}} />
              </>
            )}
            <ChecklistItem id="s1_11" completed={completedIds.has('s1_11')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Request prescription history from home country pharmacy" actionLabel="Learn more" onAction={() => {}} last />
          </div>
        </Section>

        {/* ── SECTION 2: WEEK 1 ── */}
        <Section title="Week 1 — Do Immediately" subtitle="Your first 7 days in the US"
          badge="urgent" open={open.s2} onToggle={() => toggle('s2')} doneCount={s2Done} totalCount={s2Total}>
          <div className="pt-1">
            <ChecklistItem id="s2_01" completed={completedIds.has('s2_01')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Research US auto insurance options — you can typically keep Canadian plates and insurance until around the 6-month mark" actionLabel="Browse options" onAction={() => setCategory('auto-insurance')} />
            <ChecklistItem id="s2_02" completed={completedIds.has('s2_02')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Set up homeowners or renters insurance for your new home" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s2_03" completed={completedIds.has('s2_03')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Know your emergency healthcare options before coverage starts" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s2_04" completed={completedIds.has('s2_04')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Note your home country vehicle plate/registration expiry date" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s2_05" completed={completedIds.has('s2_05')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Open US bank account" actionLabel="Find one" onAction={() => setCategory('banking')} />
            <ChecklistItem id="s2_06" completed={completedIds.has('s2_06')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Set up US cell phone plan" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s2_07" completed={completedIds.has('s2_07')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Set up utilities (electric, internet, water)" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem
              id="s2_08" completed={completedIds.has('s2_08')} onToggle={toggleItem} onLearnMore={onLearnMore}
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
            <ChecklistItem id="s3_01" completed={completedIds.has('s3_01')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Enroll in US health insurance" actionLabel="Find options" onAction={() => {}} />
            <ChecklistItem id="s3_02" completed={completedIds.has('s3_02')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Apply for SSN once eligible — eligibility and timing vary significantly by visa type" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s3_03" completed={completedIds.has('s3_03')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Update your address with USCIS (Form AR-11)" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s3_04" completed={completedIds.has('s3_04')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Engage financial advisor" actionLabel="Find one" onAction={() => navigate('/j5')} />
            <ChecklistItem id="s3_05" completed={completedIds.has('s3_05')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Get Florida driver's licence once required — timing depends on your visa type and residency status" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s3_06" completed={completedIds.has('s3_06')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Build US credit history — open secured credit card or use Nova Credit" actionLabel="Learn how" onAction={() => {}} />
            {withChildren && (
              <>
                {withAgeOut && <AgeOutAwarenessItem onCoach={() => navigate('/j4')} />}
                <ChecklistItem id="s3_07" completed={completedIds.has('s3_07')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Research school districts in your destination area" actionLabel="Research" onAction={() => {}} />
                <ChecklistItem id="s3_08" completed={completedIds.has('s3_08')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Register children in school" actionLabel="Learn more" onAction={() => {}} />
              </>
            )}
            <ChecklistItem id="s3_09" completed={completedIds.has('s3_09')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Update home country address with tax authority and banks" actionLabel="Learn more" onAction={() => {}} last />
          </div>
        </Section>

        {/* ── SECTION 4: MONTHS 1-3 ── */}
        <Section title="Months 1–3" subtitle="Complete within your first 90 days"
          open={open.s4} onToggle={() => toggle('s4')} doneCount={s4Done} totalCount={s4Total}>
          <div className="pt-1">
            <ChecklistItem id="s4_01" completed={completedIds.has('s4_01')} onToggle={toggleItem} onLearnMore={onLearnMore} label="SSN follow-up (3 weeks after applying)" actionLabel="Track status" onAction={() => {}} />
            <ChecklistItem id="s4_02" completed={completedIds.has('s4_02')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Find primary care physician" actionLabel="Find one" onAction={() => navigate('/j5')} />
            <ChecklistItem id="s4_03" completed={completedIds.has('s4_03')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Find dentist" actionLabel="Find one" onAction={() => navigate('/j5')} />
            <ChecklistItem id="s4_04" completed={completedIds.has('s4_04')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Transfer prescription records" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s4_05" completed={completedIds.has('s4_05')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Register imported vehicle in Florida (use tax due on vehicle value)" actionLabel="Learn more" onAction={() => {}} last={!withChildren} />
            {withChildren && (
              <ChecklistItem id="s4_06" completed={completedIds.has('s4_06')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Enroll children in school (if not done in Month 1)" actionLabel="Find your district" onAction={() => {}} last />
            )}
          </div>
        </Section>

        {/* ── SECTION 5: MONTHS 3-6 ── */}
        <Section title="Months 3–6" subtitle="Time-sensitive items approaching"
          open={open.s5} onToggle={() => toggle('s5')} doneCount={s5Done} totalCount={s5Total}>
          <div className="pt-1">
            <ChecklistItem
              id="s5_01" completed={completedIds.has('s5_01')} onToggle={toggleItem} onLearnMore={onLearnMore}
              label="Confirm auto insurance covers you beyond 6 months"
              urgencyNote="Canadian coverage typically voids around the 6-month mark — confirm with your insurer before then"
              actionLabel="Check now"
              onAction={() => setCategory('auto-insurance')}
            />
            <ChecklistItem id="s5_02" completed={completedIds.has('s5_02')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Renew or cancel home country vehicle plates/registration before it expires" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s5_03" completed={completedIds.has('s5_03')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Review US credit score progress" actionLabel="Check score" onAction={() => {}} />
            <ChecklistItem id="s5_04" completed={completedIds.has('s5_04')} onToggle={toggleItem} onLearnMore={onLearnMore} label="File FBAR for the prior tax year if foreign accounts exceeded $10K (due the following April 15)" actionLabel="Learn more" onAction={() => {}} last />
          </div>
        </Section>

        {/* ── SECTION 6: ONGOING — IMMIGRATION ── */}
        <Section title="Ongoing — Immigration" subtitle="Never miss these milestones"
          open={open.s6} onToggle={() => toggle('s6')} doneCount={s6Done} totalCount={s6Total}>
          <div className="pt-1">
            <ChecklistItem id="s6_01" completed={completedIds.has('s6_01')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Track visa application processing timeline" actionLabel="Track" onAction={() => {}} />
            <ChecklistItem id="s6_02" completed={completedIds.has('s6_02')} onToggle={toggleItem} onLearnMore={onLearnMore} label="File USCIS Service Request if processing exceeds normal range" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s6_03" completed={completedIds.has('s6_03')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Contact congressional office if delays persist" actionLabel="Learn more" onAction={() => {}} />
            <ChecklistItem id="s6_04" completed={completedIds.has('s6_04')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Calendar conditional green card interview (when scheduled)" actionLabel="Set reminder" onAction={() => {}} />
            <ChecklistItem id="s6_05" completed={completedIds.has('s6_05')} onToggle={toggleItem} onLearnMore={onLearnMore} label="Calendar I-829 filing window (90 days before 2-year green card expiry)" actionLabel="Set reminder" onAction={() => {}} last />
          </div>
        </Section>

      </div>

      <TabBar active="essentials" />
    </div>
  )
}
