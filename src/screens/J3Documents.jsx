import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
  uploaded:    { label: 'Uploaded',         color: '#1A7A4A', bg: '#D1FAE5', icon: '✓' },
  pending:     { label: 'Pending',          color: '#F0A500', bg: '#FEF3C7', icon: '⏳' },
  required:    { label: 'Required',         color: '#A0AEC0', bg: '#F1F5F9', icon: '○' },
  not_started: { label: 'Not Started',      color: '#A0AEC0', bg: '#F1F5F9', icon: '○' },
  flagged:     { label: 'Issue Noted',      color: '#DC2626', bg: '#FEE2E2', icon: '!' },
  follow_up:   { label: 'Follow-Up Needed', color: '#F0A500', bg: '#FEF3C7', icon: '→' },
}

// Status cycle for tap-to-cycle: required → pending → uploaded → required
const STATUS_CYCLE = ['required', 'pending', 'uploaded']

// ── Document seed templates by visa type ──────────────────────────────────────
// Each entry: { name, phase }  — status defaults to 'required'
const SEED_DOCS = {
  eb5: [
    { name: 'Passport',                                                  phase: 1 },
    { name: 'Birth certificate',                                          phase: 1 },
    { name: 'Marriage certificate (if applicable)',                       phase: 1 },
    { name: "Dependent children's birth certificates (if applicable)",   phase: 1 },
    { name: 'Source of funds documentation',                              phase: 1 },
    { name: 'Bank statements — 6 months',                                 phase: 1 },
    { name: 'Tax returns — 5 years (source of funds)',                    phase: 1 },
    { name: 'I-526E / I-526 petition',                                    phase: 2 },
    { name: 'Regional center offering documents (PPM)',                   phase: 2 },
    { name: 'Business plan (direct investment only)',                     phase: 2 },
    { name: 'Regional center subscription agreement',                     phase: 2 },
    { name: 'Regional center administrative fee receipt (non-refundable)', phase: 2 },
    { name: 'Investment wire transfer confirmation',                      phase: 2 },
    { name: 'Escrow release confirmation',                                phase: 2 },
    { name: 'Medical examination (I-693)',                                phase: 3 },
    { name: 'Biometrics appointment confirmation',                        phase: 3 },
    { name: 'I-485 application (or DS-260 if consular processing)',       phase: 4 },
    { name: 'I-765 work authorization',                                   phase: 4 },
    { name: 'I-131 travel document',                                      phase: 4 },
    { name: 'US bank account confirmation',                               phase: 5 },
    { name: 'SSN application',                                            phase: 5 },
    { name: 'I-829 petition — removal of conditions',                     phase: 5 },
    { name: 'Job creation evidence (for I-829)',                          phase: 5 },
  ],
  e2: [
    { name: 'Passport',                                                    phase: 1 },
    { name: 'Birth certificate',                                            phase: 1 },
    { name: 'Marriage certificate (if applicable)',                         phase: 1 },
    { name: 'Dependent children\'s birth certificates (if applicable)',     phase: 1 },
    { name: 'Source of funds documentation',                                phase: 1 },
    { name: 'Bank statements — 6 months',                                   phase: 1 },
    { name: 'Business plan',                                                phase: 2 },
    { name: 'Investment documentation',                                     phase: 2 },
    { name: 'Lease or purchase agreement (business)',                       phase: 2 },
    { name: 'Escrow agreement (if applicable)',                             phase: 2 },
    { name: 'Wire transfer confirmations',                                  phase: 2 },
    { name: 'Corporate formation documents — articles + operating agreement', phase: 2 },
    { name: 'EIN confirmation letter (IRS)',                                phase: 2 },
    { name: 'Target business financial statements — 2 years',               phase: 2 },
    { name: 'Closing statement / bill of sale',                             phase: 2 },
    { name: 'DS-160 application',                                           phase: 3 },
    { name: 'DS-156E — Treaty Investor application',                        phase: 3 },
    { name: 'E-2 visa interview appointment',                               phase: 3 },
    { name: 'US bank account confirmation',                                 phase: 4 },
    { name: 'EIN / business registration',                                  phase: 4 },
  ],
  tn: [
    { name: 'Passport',                                                        phase: 1 },
    { name: 'Degree / professional credentials',                                phase: 1 },
    { name: 'Employment offer letter',                                          phase: 1 },
    { name: 'Resume / CV',                                                      phase: 1 },
    { name: 'Professional license or registration (if applicable)',             phase: 1 },
    { name: 'Marriage certificate (for TD spouse, if applicable)',              phase: 1 },
    { name: "Children's birth certificates (for TD dependents, if applicable)", phase: 1 },
    { name: 'TN application package',                                           phase: 2 },
    { name: 'Border crossing confirmation',                                     phase: 2 },
    { name: 'I-94 record',                                                      phase: 3 },
    { name: 'US bank account confirmation',                                     phase: 5 },
    { name: 'SSN application',                                                  phase: 5 },
  ],
  l1: [
    { name: 'Passport',                               phase: 1 },
    { name: 'Employment verification letter',          phase: 1 },
    { name: 'Organizational charts',                   phase: 1 },
    { name: 'I-129 petition (employer filed)',          phase: 2 },
    { name: 'Support letter from employer',            phase: 2 },
    { name: 'Visa stamp / consular approval',          phase: 3 },
    { name: 'I-94 record',                             phase: 3 },
    { name: 'US bank account confirmation',            phase: 4 },
    { name: 'SSN application',                         phase: 4 },
  ],
  h1b: [
    { name: 'Passport',                               phase: 1 },
    { name: 'Degree certificates',                     phase: 1 },
    { name: 'Labor Condition Application (LCA)',       phase: 2 },
    { name: 'I-129 petition (employer filed)',          phase: 2 },
    { name: 'Lottery selection notice',                phase: 2 },
    { name: 'Visa stamp',                              phase: 3 },
    { name: 'I-94 record',                             phase: 3 },
    { name: 'US bank account confirmation',            phase: 4 },
    { name: 'SSN application',                         phase: 4 },
  ],
  o1: [
    { name: 'Passport',                               phase: 1 },
    { name: 'Evidence of extraordinary ability',       phase: 1 },
    { name: 'Advisory opinion letter',                 phase: 1 },
    { name: 'Employment offer / agent letter',         phase: 2 },
    { name: 'I-129 petition (employer filed)',          phase: 2 },
    { name: 'Visa stamp',                              phase: 3 },
    { name: 'I-94 record',                             phase: 3 },
    { name: 'US bank account confirmation',            phase: 4 },
  ],
  k1: [
    { name: 'Passport',                               phase: 1 },
    { name: 'Birth certificate',                       phase: 1 },
    { name: 'Proof of US citizen sponsor status',     phase: 1 },
    { name: 'I-129F petition',                         phase: 2 },
    { name: 'DS-160 application',                      phase: 2 },
    { name: 'Medical examination',                     phase: 3 },
    { name: 'K-1 visa stamp',                          phase: 3 },
    { name: 'I-485 adjustment of status',              phase: 4 },
    { name: 'Marriage certificate',                    phase: 4 },
    { name: 'US bank account confirmation',            phase: 5 },
    { name: 'SSN application',                         phase: 5 },
  ],
  eb2niw: [
    { name: 'Passport',                               phase: 1 },
    { name: 'Degree certificates',                     phase: 1 },
    { name: 'Evidence of exceptional ability',         phase: 1 },
    { name: 'National interest waiver justification',  phase: 2 },
    { name: 'I-140 petition',                          phase: 2 },
    { name: 'Priority date tracking',                  phase: 3 },
    { name: 'I-485 adjustment of status',              phase: 4 },
    { name: 'Medical examination (I-693)',             phase: 4 },
    { name: 'US bank account confirmation',            phase: 5 },
    { name: 'SSN application',                         phase: 5 },
  ],
}

const PHASE_TITLES = {
  1: 'Phase 1 — Identity & Credentials',
  2: 'Phase 2 — Application & Filings',
  3: 'Phase 3 — Medical, Biometrics & Visas',
  4: 'Phase 4 — USCIS / Adjustment',
  5: 'Phase 5 — US Life Setup',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function nextStatus(current) {
  const idx = STATUS_CYCLE.indexOf(current)
  if (idx === -1) return 'pending'
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

function isExpiringSoon(expiry_date) {
  if (!expiry_date) return false
  const days = (new Date(expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
  return days <= 90
}

function groupByPhase(docs) {
  const map = {}
  docs.forEach(doc => {
    const p = doc.phase ?? 1
    if (!map[p]) map[p] = []
    map[p].push(doc)
  })
  return Object.keys(map).sort((a, b) => a - b).map(p => ({
    id: Number(p),
    title: PHASE_TITLES[p] ?? `Phase ${p}`,
    docs: map[p],
  }))
}

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
  const urgent = doc.urgent ?? true
  const expiresLabel = doc.expires ?? doc.expiry_date ?? ''
  return (
    <div
      className="rounded-2xl px-4 py-3 flex flex-col gap-3"
      style={{
        backgroundColor: urgent ? '#FEF2F2' : '#FFFBEB',
        border: `1px solid ${urgent ? '#FCA5A5' : '#FCD34D'}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold" style={{ color: urgent ? '#991B1B' : '#92400E' }}>
            {doc.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: urgent ? '#DC2626' : '#F0A500' }}>
            Expires: {expiresLabel}
          </p>
        </div>
        <span className="text-lg">{urgent ? '🔴' : '🟡'}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="flex-1 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: urgent ? '#991B1B' : '#92400E' }}
        >
          View
        </button>
        <button
          className="flex-1 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
          style={{ backgroundColor: urgent ? '#DC2626' : '#F0A500', color: '#FFFFFF' }}
        >
          Upload renewal
        </button>
      </div>
    </div>
  )
}

// ── Document row ──────────────────────────────────────────────────────────────
function DocRow({ doc, isLast, onCycle, onView, onUploadClick, uploading, uploadError }) {
  const statusKey = STATUS[doc.status] ? doc.status : 'required'
  const s = STATUS[statusKey]

  const showUpload = doc.status === 'required' || doc.status === 'pending'
  const showView   = doc.status === 'uploaded' && !!doc.file_url

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
        {doc.updateError && (
          <p className="text-xs mt-0.5 font-semibold" style={{ color: '#DC2626' }}>
            {doc.updateError}
          </p>
        )}
        {uploadError && (
          <p className="text-xs mt-0.5 font-semibold" style={{ color: '#DC2626' }}>
            {uploadError}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {uploading ? (
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: '#EBF4FB' }} />
            <div
              className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#1B5FA8', borderTopColor: 'transparent' }}
            />
          </div>
        ) : showView ? (
          <button
            onClick={() => onView?.(doc)}
            className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 transition-all active:scale-95"
            style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8' }}
          >
            View
          </button>
        ) : showUpload ? (
          <button
            onClick={() => onUploadClick?.(doc.id)}
            className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 transition-all active:scale-95"
            style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8' }}
          >
            Upload
          </button>
        ) : null}
        <button
          onClick={() => onCycle?.(doc)}
          disabled={!onCycle}
          className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 transition-all active:scale-95"
          style={{ backgroundColor: s.bg, color: s.color, cursor: onCycle ? 'pointer' : 'default' }}
        >
          {s.icon} {s.label}
        </button>
      </div>
    </div>
  )
}

// ── Phase section ─────────────────────────────────────────────────────────────
function PhaseSection({ phase, onCycle, onView, onUploadClick, uploadingDocId, uploadErrors }) {
  const [open, setOpen] = useState(phase.id <= 2)

  const uploadedCount = phase.docs.filter((d) => d.status === 'uploaded').length
  const hasIssue      = phase.docs.some((d) => d.status === 'flagged' || d.status === 'follow_up')
  const hasPending    = phase.docs.some((d) => d.status === 'pending' || d.status === 'not_started' || d.status === 'required')

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
            <DocRow
              key={doc.id}
              doc={doc}
              isLast={i === phase.docs.length - 1}
              onCycle={onCycle}
              onView={onView}
              onUploadClick={onUploadClick}
              uploading={uploadingDocId === doc.id}
              uploadError={uploadErrors?.[doc.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function J3Documents() {
  const [docs, setDocs]           = useState(null) // null = loading
  const [userId, setUserId]       = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [toast, setToast]         = useState(null)
  const fileInputRef              = useRef(null)
  const [activeUploadDocId, setActiveUploadDocId] = useState(null)
  const [uploadingDocId, setUploadingDocId]       = useState(null)
  const [uploadErrors, setUploadErrors]           = useState({})

  async function fetchDocs(uid) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', uid)
      .order('phase', { ascending: true })
    if (error) throw new Error(error.message)
    return data || []
  }

  async function seedDocs(uid, visaType) {
    const visaKey = (visaType || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    const templates = SEED_DOCS[visaKey] || (() => {
      console.warn(`seedDocs: no document set for visa key "${visaKey}" (raw: "${visaType}") — falling back to eb5`)
      return SEED_DOCS['eb5']
    })()
    const rows = templates.map(t => ({
      user_id: uid,
      name:    t.name,
      phase:   t.phase,
      status:  'required',
    }))
    const { error } = await supabase.from('documents').insert(rows)
    if (error) throw new Error(error.message)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      if (!user) {
        setDocs([])
        return
      }
      setUserId(user.id)
      try {
        let rows = await fetchDocs(user.id)
        if (rows.length === 0) {
          // Fetch visa_type from users table for seeding
          const { data: userRow } = await supabase
            .from('users')
            .select('visa_type')
            .eq('id', user.id)
            .single()
          await seedDocs(user.id, userRow?.visa_type ?? 'eb5')
          rows = await fetchDocs(user.id)
        }
        setDocs(rows)
      } catch (err) {
        setLoadError(err.message)
        setDocs([])
      }
    })
  }, [])

  const handleCycle = useCallback(async (doc) => {
    const newStatus = nextStatus(doc.status)
    // Optimistic update
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: newStatus, updateError: null } : d))
    const { error } = await supabase
      .from('documents')
      .update({ status: newStatus })
      .eq('id', doc.id)
    if (error) {
      // Revert + show inline error
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: doc.status, updateError: 'Update failed — tap to retry' } : d))
    }
  }, [])

  function showPdfToast() {
    setToast('PDF export coming soon')
    setTimeout(() => setToast(null), 2500)
  }

  async function handleUpload(doc, file) {
    try {
      const path = `documents/${userId}/${doc.id}_${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('migratrak-files')
        .upload(path, file, { contentType: file.type })
      if (uploadError) throw uploadError

      const { error: updateError } = await supabase
        .from('documents')
        .update({ file_url: path, status: 'uploaded' })
        .eq('id', doc.id)
      if (updateError) throw updateError

      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, file_url: path, status: 'uploaded', updateError: null } : d))
    } catch (err) {
      console.error('Document upload failed:', err)
      throw new Error(err.message || 'Upload failed', { cause: err })
    }
  }

  function handleUploadClick(docId) {
    setActiveUploadDocId(docId)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    const docId = activeUploadDocId
    e.target.value = ''
    if (!file || docId == null) return
    const doc = (docs ?? []).find(d => d.id === docId)
    if (!doc) return
    setUploadErrors(prev => ({ ...prev, [docId]: null }))
    setUploadingDocId(docId)
    try {
      await handleUpload(doc, file)
    } catch (err) {
      setUploadErrors(prev => ({ ...prev, [docId]: err.message || 'Upload failed' }))
    } finally {
      setUploadingDocId(null)
    }
  }

  async function handleView(doc) {
    try {
      const { data, error } = await supabase.storage
        .from('migratrak-files')
        .createSignedUrl(doc.file_url, 60 * 5)
      if (error) throw error
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Failed to open document:', err)
      setToast('Could not open document')
      setTimeout(() => setToast(null), 2500)
    }
  }

  // ── Derived state ────────────────────────────────────────────────────────────
  const loading = docs === null

  const phases = groupByPhase(docs ?? [])

  const expiringDocs = (docs ?? []).filter(d => isExpiringSoon(d.expiry_date)).map(d => ({
    ...d,
    expires: d.expiry_date,
    urgent: (new Date(d.expiry_date) - new Date()) / (1000 * 60 * 60 * 24) <= 30,
  }))

  const allDocs  = docs ?? []
  const total    = allDocs.length
  const uploaded = allDocs.filter(d => d.status === 'uploaded').length
  const pending  = allDocs.filter(d => d.status === 'pending').length
  const expiring = expiringDocs.length

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{ transform: 'translateX(-50%)', backgroundColor: '#0D2B4E', color: '#FFFFFF', whiteSpace: 'nowrap' }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#4A9FD4' }}>
          Document Tracker
        </p>
        <div className="flex items-stretch gap-2">
          <StatChip number={loading ? '—' : total}    label="Required"  color="#FFFFFF" />
          <div className="w-px" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <StatChip number={loading ? '—' : uploaded} label="Uploaded"  color="#4A9FD4" />
          <div className="w-px" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <StatChip number={loading ? '—' : pending}  label="Pending"   color="#F0A500" />
          <div className="w-px" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <StatChip number={loading ? '—' : expiring} label="Expiring"  color="#DC2626" />
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">

        {/* Load error */}
        {loadError && (
          <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
            <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>
              Could not load documents: {loadError}
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <p className="text-sm px-1" style={{ color: '#A0AEC0' }}>Loading…</p>
        )}

        {/* Expiring soon */}
        {!loading && expiringDocs.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#DC2626' }}>
              ⚠️ Expiring Soon
            </p>
            {expiringDocs.map((doc) => (
              <ExpiryCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}

        {/* Phase sections */}
        {!loading && phases.length > 0 && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#4A5568' }}>
              Documents by Phase
            </p>
            {phases.map((phase) => (
              <PhaseSection
                key={phase.id}
                phase={phase}
                onCycle={handleCycle}
                onView={handleView}
                onUploadClick={handleUploadClick}
                uploadingDocId={uploadingDocId}
                uploadErrors={uploadErrors}
              />
            ))}
          </>
        )}

        {/* Bottom buttons */}
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex gap-3">
            <button
              className="flex-1 py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
            >
              Request from attorney
            </button>
            <button
              onClick={showPdfToast}
              className="flex-1 py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
            >
              Export PDF inventory
            </button>
          </div>
        </div>

      </div>

      <input
        type="file"
        accept="image/*,application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <TabBar active="documents" />
    </div>
  )
}
