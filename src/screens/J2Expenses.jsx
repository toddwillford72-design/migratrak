import { useState, useEffect, useRef } from 'react'
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

const CATEGORIES = [
  'Legal Fees',
  'Filing Fees',
  'Business / Investment',
  'Regional Center Fee',
  'Travel & Hotels',
  'Medical Exams',
  'Moving Costs',
  'Professional Services',
]

const INITIAL_EXPENSES = [
  { id: 1,  category: 'Legal Fees',              amount: 34500, label: 'Immigration attorney retainer + consultations', date: 'Various' },
  { id: 2,  category: 'Filing Fees',             amount: 18420, label: 'I-526, I-485, I-765, I-131 filing fees',      date: 'Various' },
  { id: 3,  category: 'Business / Investment',   amount:  5500,  label: 'Business plan preparation + due diligence',     date: 'Various' },
  { id: 8,  category: 'Regional Center Fee',     amount: 60000,  label: 'EB5AN regional center administrative fee — paid upfront with I-526E', date: 'Feb 2025' },
  { id: 4,  category: 'Travel & Hotels',         amount: 12400, label: 'Site visits, consultations, relocation trips', date: 'Various' },
  { id: 5,  category: 'Medical Exams',           amount:  3800, label: 'I-693 medical exams — family of 4',            date: 'Apr 2026' },
  { id: 6,  category: 'Moving Costs',            amount:  9600, label: 'International moving company',                 date: 'Jan 2026' },
  { id: 7,  category: 'Professional Services',   amount:  7360, label: 'Financial advisor, CPA, translator',           date: 'Various' },
]

const CAT_COLORS = {
  'Legal Fees':             '#1B5FA8',
  'Filing Fees':            '#4A9FD4',
  'Business / Investment':  '#1A7A4A',
  'Regional Center Fee':    '#7C3AED',
  'Travel & Hotels':        '#F0A500',
  'Medical Exams':          '#9333EA',
  'Moving Costs':           '#DC2626',
  'Professional Services':  '#0D2B4E',
}

function emptyForm() {
  return {
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    vendor: '',
    category: CATEGORIES[0],
    description: '',
    isQualifyingInvestment: false,
    receipt: null,
  }
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

// ── Category bar ──────────────────────────────────────────────────────────────
function CategoryBar({ category, amount, max, flash }) {
  const pct = Math.round((amount / max) * 100)
  const color = CAT_COLORS[category] ?? '#4A5568'
  return (
    <div
      className="flex flex-col gap-1 rounded-xl px-3 py-2.5 transition-all duration-500"
      style={{ backgroundColor: flash ? '#D1FAE5' : 'transparent' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: '#4A5568' }}>{category}</span>
        <span className="text-xs font-extrabold tabular-nums" style={{ color: '#0D2B4E' }}>
          ${amount.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ── Add expense panel ─────────────────────────────────────────────────────────
function AddExpensePanel({ onClose, onSave }) {
  // 'form' is default; 'capture' | 'loading' are the optional receipt sub-flow
  const [stage, setStage]         = useState('form')
  const [form, setForm]           = useState(emptyForm())
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState(null)
  const timerRef                  = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleCapture() {
    setStage('loading')
    timerRef.current = setTimeout(() => {
      setForm(f => ({ ...f, receipt: 'IMG_receipt.jpg' }))
      setStage('form')
    }, 2000)
  }

  async function handleSave() {
    setSaveError(null)
    if (!form.amount || isNaN(parseFloat(String(form.amount)))) {
      setSaveError('Please enter a valid amount.')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      setStage('done')
      setTimeout(onClose, 800)
    } catch (err) {
      setSaveError(err.message || 'Failed to save expense. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#E2E8F0' }} />
        </div>

        {/* STAGE: capture (optional receipt sub-flow) */}
        {stage === 'capture' && (
          <>
            <h2 className="text-lg font-extrabold" style={{ color: '#0D2B4E' }}>Attach Receipt</h2>
            <p className="text-sm" style={{ color: '#4A5568' }}>Capture a receipt or upload from your library</p>
            <button
              onClick={handleCapture}
              className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
              style={{ backgroundColor: '#0D2B4E', color: '#FFFFFF' }}
            >
              <span className="text-2xl">📷</span>
              <span className="text-base font-bold">Take photo of receipt</span>
            </button>
            <button
              onClick={handleCapture}
              className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
              style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '2px solid #1B5FA8' }}
            >
              <span className="text-2xl">🖼️</span>
              <span className="text-base font-bold">Upload from camera roll</span>
            </button>
            <button onClick={() => setStage('form')} className="text-sm text-center" style={{ color: '#A0AEC0' }}>
              Cancel
            </button>
          </>
        )}

        {/* STAGE: loading (simulated OCR) */}
        {stage === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-5 py-10">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: '#EBF4FB' }} />
              <div
                className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: '#1B5FA8', borderTopColor: 'transparent' }}
              />
            </div>
            <div className="text-center">
              <p className="text-base font-extrabold" style={{ color: '#0D2B4E' }}>Reading receipt…</p>
              <p className="text-sm mt-1" style={{ color: '#4A5568' }}>Extracting amount, vendor, and date</p>
            </div>
          </div>
        )}

        {/* STAGE: form (primary / default) */}
        {stage === 'form' && (
          <>
            <h2 className="text-lg font-extrabold" style={{ color: '#0D2B4E' }}>Add Expense</h2>

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                Amount <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC' }}>
                <span className="pl-4 text-sm font-bold" style={{ color: '#4A5568' }}>$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="flex-1 px-3 py-3 text-sm bg-transparent outline-none"
                  style={{ color: '#0D2B4E' }}
                />
              </div>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#4A5568' }}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
              />
            </div>

            {/* Vendor */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#4A5568' }}>Vendor</label>
              <input
                type="text"
                placeholder="e.g. Maimone Law"
                value={form.vendor}
                onChange={(e) => setForm(f => ({ ...f, vendor: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#4A5568' }}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                Description <span className="font-normal normal-case" style={{ color: '#A0AEC0' }}>(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. I-485 filing fee"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
              />
            </div>

            {/* Qualifying investment toggle */}
            <button
              onClick={() => setForm(f => ({ ...f, isQualifyingInvestment: !f.isQualifyingInvestment }))}
              className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
              style={{
                backgroundColor: form.isQualifyingInvestment ? '#EBF4FB' : '#F7F9FC',
                border: '2px solid ' + (form.isQualifyingInvestment ? '#1B5FA8' : '#E2E8F0'),
              }}
            >
              <div>
                <p className="text-sm font-semibold text-left" style={{ color: '#0D2B4E' }}>Qualifying investment</p>
                <p className="text-xs text-left" style={{ color: '#64748B' }}>Count toward E-2 / EB-5 investment total</p>
              </div>
              <div
                className="flex items-center flex-shrink-0 ml-3 rounded-full transition-colors"
                style={{
                  width: 44, height: 24, padding: '2px',
                  backgroundColor: form.isQualifyingInvestment ? '#1B5FA8' : '#CBD5E0',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: form.isQualifyingInvestment ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </div>
            </button>

            {/* Receipt attachment (optional) */}
            {form.receipt ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E2E8F0' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧾</span>
                  <span className="text-xs font-semibold" style={{ color: '#1B5FA8' }}>{form.receipt} — attached</span>
                </div>
                <button onClick={() => setForm(f => ({ ...f, receipt: null }))} className="text-xs" style={{ color: '#A0AEC0' }}>
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => setStage('capture')}
                className="text-sm font-semibold text-center transition-opacity active:opacity-60"
                style={{ color: '#1B5FA8' }}
              >
                📎 Attach receipt photo (optional)
              </button>
            )}

            {/* Save error */}
            {saveError && (
              <p className="text-sm font-semibold px-1" style={{ color: '#DC2626' }}>{saveError}</p>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#F0A500', color: '#0D2B4E', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : 'Save Expense'}
            </button>

            <button onClick={onClose} className="text-sm text-center" style={{ color: '#A0AEC0' }}>
              Cancel
            </button>
          </>
        )}

        {/* STAGE: done */}
        {stage === 'done' && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#1A7A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-base font-extrabold" style={{ color: '#0D2B4E' }}>Expense saved!</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Investment Passport view ──────────────────────────────────────────────────

const PASSPORT_INVESTMENTS = [
  { category: 'Legal & Professional',                amount: 34500,   receipts: true },
  { category: 'Government Filing Fees',              amount: 18420,   receipts: true },
  { category: 'Regional Center Investment',          amount: 800000,  receipts: true },
  { category: 'Regional Center Administrative Fee',  amount: 60000,   receipts: true },
  { category: 'Business Due Diligence',              amount: 5500,    receipts: true },
  { category: 'Medical Examinations',                amount: 3800,    receipts: true },
]

const PASSPORT_DOCUMENTED = PASSPORT_INVESTMENTS
  .filter((i) => i.receipts)
  .reduce((s, i) => s + i.amount, 0)

function PassportRow({ item }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-3">
        <span className="text-sm font-semibold" style={{ color: '#0D2B4E' }}>{item.category}</span>
        <span className="text-xs font-semibold" style={{ color: item.receipts ? '#1A7A4A' : '#F0A500' }}>
          {item.receipts ? '✅ Receipts attached' : '⚠️ Receipt missing'}
        </span>
      </div>
      <span className="text-sm font-extrabold tabular-nums flex-shrink-0" style={{ color: '#0D2B4E' }}>
        ${item.amount.toLocaleString()}
      </span>
    </div>
  )
}

function ComplianceRow({ label, status }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #E2E8F0' }}>
      <span className="text-sm" style={{ color: '#0D2B4E' }}>{label}</span>
      <span
        className="text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: status ? '#D1FAE5' : '#FEF2F2', color: status ? '#1A7A4A' : '#DC2626' }}
      >
        {status ? 'YES' : 'NO'}
      </span>
    </div>
  )
}

function InvestmentPassport({ userName, onToast }) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const totalInvestment = 800000
  const documented = PASSPORT_DOCUMENTED

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-40">

      {/* Passport header card */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0D2B4E', border: '2px solid #1B5FA8' }}>
        <div className="px-5 pt-5 pb-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1B5FA8' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <path d="M16 3v4M8 3v4M2 11h20" />
              </svg>
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em]" style={{ color: '#4A9FD4' }}>
              Investment Financial Passport
            </p>
          </div>
          <p className="text-lg font-extrabold leading-tight" style={{ color: '#FFFFFF' }}>
            EB-5 Journey — {userName}
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Prepared for USCIS documentation purposes
          </p>
        </div>
        <div className="grid grid-cols-2 divide-x" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.12)' }}>
          <div className="px-5 py-3">
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Qualifying Investment</p>
            <p className="text-xl font-extrabold tabular-nums" style={{ color: '#F0A500' }}>
              ${totalInvestment.toLocaleString()}
            </p>
          </div>
          <div className="px-5 py-3">
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Documented w/ Receipts</p>
            <p className="text-xl font-extrabold tabular-nums" style={{ color: '#FFFFFF' }}>
              ${documented.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Source of Funds Verified</p>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#D1FAE5', color: '#1A7A4A' }}>
              YES ✓
            </span>
          </div>
        </div>
      </div>

      {/* Investment summary */}
      <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <p className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: '#4A5568' }}>
          Investment Summary by Category
        </p>
        {PASSPORT_INVESTMENTS.map((item) => (
          <PassportRow key={item.category} item={item} />
        ))}
        <div className="flex items-center justify-between pt-3">
          <span className="text-sm font-extrabold uppercase tracking-wider" style={{ color: '#0D2B4E' }}>Total</span>
          <span className="text-base font-extrabold tabular-nums" style={{ color: '#0D2B4E' }}>
            ${PASSPORT_INVESTMENTS.reduce((s, i) => s + i.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* USCIS compliance */}
      <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: '#4A5568' }}>
          USCIS Compliance Status
        </p>
        <ComplianceRow label="Investment threshold met ($800,000+)" status={true} />
        <ComplianceRow label="Source of funds documented" status={true} />
        <ComplianceRow label="Investment at risk confirmed" status={true} />
      </div>

      {/* Action buttons */}
      <button
        onClick={() => onToast('Coming soon — USCIS Investment Package PDF')}
        className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ backgroundColor: '#0D2B4E', color: '#FFFFFF' }}
      >
        <span>📋</span> Generate USCIS Investment Package PDF
      </button>
      <button
        onClick={() => onToast('Coming soon — Share with Attorney')}
        className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '2px solid #1B5FA8' }}
      >
        <span>📤</span> Share with Attorney
      </button>

      <p className="text-center text-xs pb-4" style={{ color: '#A0AEC0' }}>
        Last updated: {today}
      </p>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function dbRowToExpense(row) {
  return {
    id:       row.id,
    category: row.category ?? 'Professional Services',
    amount:   parseFloat(row.amount) || 0,
    label:    row.description || row.vendor || 'Expense',
    date:     row.expense_date ?? row.created_at?.slice(0, 10) ?? '—',
    isNew:    false,
  }
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function J2Expenses() {
  const [expenses, setExpenses]   = useState(null) // null = loading
  const [isDemo, setIsDemo]       = useState(false)
  const [userId, setUserId]       = useState(null)
  const [userName, setUserName]   = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [view, setView]           = useState('expenses')
  const [toast, setToast]         = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [flashCat, setFlashCat]   = useState(null)

  async function fetchExpenses(uid) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', uid)
        .order('expense_date', { ascending: false })
      if (error) throw error
      return (data || []).map(dbRowToExpense)
    } catch (err) {
      throw new Error(err.message || 'Failed to load expenses')
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      if (!user) {
        setIsDemo(true)
        setExpenses(INITIAL_EXPENSES)
        return
      }
      setUserId(user.id)
      supabase.from('users').select('name').eq('id', user.id).single().then(({ data }) => {
        if (data?.name) setUserName(data.name)
      })
      try {
        const rows = await fetchExpenses(user.id)
        setExpenses(rows)
      } catch (err) {
        setLoadError(err.message)
        setExpenses([])
      }
    })
  }, [])

  async function handleSave(form) {
    const amount = parseFloat(String(form.amount).replace(/,/g, '')) || 0
    const expense_date = form.date || null
    const { error } = await supabase
      .from('expenses')
      .insert({
        user_id:                 userId,
        amount,
        currency:                'USD',
        category:                form.category,
        vendor:                  form.vendor || null,
        description:             form.description || null,
        expense_date,
        is_qualifying_investment: form.isQualifyingInvestment ?? false,
      })
    if (error) throw new Error(error.message || 'Insert failed')
    const rows = await fetchExpenses(userId)
    setExpenses(rows)
    setFlashCat(form.category)
    setTimeout(() => setFlashCat(null), 2000)
  }

  function handleExportPDF() {
    setToast('PDF export coming soon')
    setTimeout(() => setToast(null), 2500)
  }

  const displayExpenses = expenses ?? []

  const updatedTotals = displayExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})
  const updatedMax = Object.values(updatedTotals).length
    ? Math.max(...Object.values(updatedTotals))
    : 1

  const grandTotal = displayExpenses.reduce((s, e) => s + e.amount, 0)

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
      <div className="px-5 pt-5 pb-3" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#4A9FD4' }}>
          {isDemo ? 'Chen Family · EB-5 Journey' : 'Expense Tracker'}
        </p>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Total Tracked
            </p>
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: '#FFFFFF' }}>
              {expenses === null ? '—' : `$${grandTotal.toLocaleString()}`}
            </p>
          </div>
          {isDemo && (
            <>
              <div className="w-px" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  EB-5 Investment
                </p>
                <p className="text-2xl font-extrabold tabular-nums" style={{ color: '#F0A500' }}>
                  $800,000
                </p>
              </div>
            </>
          )}
        </div>

        {/* View tab switcher */}
        <div className="flex gap-2">
          {[{ id: 'expenses', label: 'All Expenses' }, { id: 'passport', label: 'Investment Passport' }].map((tab) => {
            const isActive = view === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: isActive ? '#F0A500' : 'rgba(255,255,255,0.12)',
                  color: isActive ? '#0D2B4E' : 'rgba(255,255,255,0.7)',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {view === 'passport' ? (
        <InvestmentPassport userName={isDemo ? 'Chen Family' : (userName || '—')} onToast={setToast} />
      ) : (

      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">

        {/* Add expense button */}
        <button
          onClick={() => setPanelOpen(true)}
          className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
        >
          <span className="text-xl font-bold">+</span> Add Expense
        </button>

        {/* Category bars */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <p className="text-xs font-extrabold uppercase tracking-widest px-4 pt-4 pb-2" style={{ color: '#4A5568' }}>
            By Category
          </p>
          <div className="px-1 pb-3">
            {CATEGORIES.map((cat) => (
              <CategoryBar
                key={cat}
                category={cat}
                amount={updatedTotals[cat] ?? 0}
                max={updatedMax}
                flash={flashCat === cat}
              />
            ))}
          </div>
        </div>

        {/* Load error */}
        {loadError && (
          <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
            <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>
              Could not load expenses: {loadError}
            </p>
          </div>
        )}

        {/* Entries */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <p className="text-xs font-extrabold uppercase tracking-widest px-4 pt-4 pb-2" style={{ color: '#4A5568' }}>
            Entries
          </p>
          {expenses === null ? (
            <p className="px-4 pb-4 text-sm" style={{ color: '#A0AEC0' }}>Loading…</p>
          ) : displayExpenses.length === 0 && !isDemo ? (
            <p className="px-4 pb-4 text-sm" style={{ color: '#A0AEC0' }}>
              No expenses tracked yet. Tap + Add Expense to start.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
              {[...displayExpenses].map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-4 py-3 transition-all duration-700"
                  style={{ backgroundColor: e.isNew ? '#D1FAE580' : 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CAT_COLORS[e.category] ?? '#4A5568' }}
                    />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0D2B4E' }}>{e.label}</p>
                      <p className="text-xs" style={{ color: '#A0AEC0' }}>{e.category} · {e.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold tabular-nums flex-shrink-0" style={{ color: '#0D2B4E' }}>
                    ${e.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
          >
            <span>📋</span> Export PDF for attorney
          </button>
          <button
            onClick={handleExportPDF}
            className="flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
          >
            <span>📊</span> Export for taxes
          </button>
        </div>

      </div>

      )}

      {panelOpen && (
        <AddExpensePanel
          onClose={() => setPanelOpen(false)}
          onSave={isDemo
            ? (form) => {
                const amount = parseFloat(String(form.amount).replace(/,/g, '')) || 0
                setExpenses(prev => [...(prev || []), {
                  id: Date.now(), category: form.category, amount,
                  label: form.description || form.vendor || 'Expense',
                  date: form.date || '—', isNew: true,
                }])
                setFlashCat(form.category)
                setTimeout(() => setFlashCat(null), 2000)
              }
            : handleSave
          }
        />
      )}

      <TabBar active="expenses" />
    </div>
  )
}
