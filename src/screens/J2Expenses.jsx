import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const USCIS_URL = 'https://egov.uscis.gov/casestatus/landing.do'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '/j1' },
  { id: 'expenses',  label: 'Expenses',  path: '/j2' },
  { id: 'documents', label: 'Documents', path: '/j3' },
  { id: 'coach',     label: 'AI Coach',  path: '/j4' },
  { id: 'directory', label: 'Directory', path: '/j5' },
  { id: 'essentials',label: 'Essentials',path: '/j6' },
  { id: 'help',      label: 'Help',      path: '/a2' },
]

const CATEGORIES = [
  'Legal Fees',
  'Filing Fees',
  'Business / Investment',
  'Travel & Hotels',
  'Medical Exams',
  'Moving Costs',
  'Professional Services',
]

const INITIAL_EXPENSES = [
  { id: 1,  category: 'Legal Fees',              amount: 34500, label: 'Immigration attorney retainer + consultations', date: 'Various' },
  { id: 2,  category: 'Filing Fees',             amount: 18420, label: 'I-526, I-485, I-765, I-131 filing fees',      date: 'Various' },
  { id: 3,  category: 'Business / Investment',   amount:  8200, label: 'Business plan + regional center fees',         date: 'Various' },
  { id: 4,  category: 'Travel & Hotels',         amount: 12400, label: 'Site visits, consultations, relocation trips', date: 'Various' },
  { id: 5,  category: 'Medical Exams',           amount:  3800, label: 'I-693 medical exams — family of 4',            date: 'Apr 2026' },
  { id: 6,  category: 'Moving Costs',            amount:  9600, label: 'International moving company',                 date: 'Jan 2026' },
  { id: 7,  category: 'Professional Services',   amount:  7360, label: 'Financial advisor, CPA, translator',           date: 'Various' },
]

const CAT_COLORS = {
  'Legal Fees':             '#1B5FA8',
  'Filing Fees':            '#4A9FD4',
  'Business / Investment':  '#1A7A4A',
  'Travel & Hotels':        '#F0A500',
  'Medical Exams':          '#9333EA',
  'Moving Costs':           '#DC2626',
  'Professional Services':  '#0D2B4E',
}

const NEW_EXPENSE = {
  amount: '3,450.00',
  date: 'June 3, 2026',
  vendor: 'Maimone Law',
  category: 'Legal Fees',
  description: 'Attorney consultation — I-485 review',
  receipt: 'IMG_4521.jpg',
}

// ── Tab bar (shared) ──────────────────────────────────────────────────────────
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
  const [stage, setStage] = useState('pick')   // pick | loading | form | done
  const [form, setForm]   = useState({ ...NEW_EXPENSE })
  const timerRef          = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleCapture(mode) {
    setStage('loading')
    timerRef.current = setTimeout(() => setStage('form'), 2000)
  }

  function handleSave() {
    setStage('done')
    setTimeout(() => { onSave(form); onClose() }, 800)
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

        {/* STAGE: pick */}
        {stage === 'pick' && (
          <>
            <h2 className="text-lg font-extrabold" style={{ color: '#0D2B4E' }}>Add Expense</h2>
            <p className="text-sm" style={{ color: '#4A5568' }}>Capture a receipt or upload from your library</p>
            <button
              onClick={() => handleCapture('camera')}
              className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
              style={{ backgroundColor: '#0D2B4E', color: '#FFFFFF' }}
            >
              <span className="text-2xl">📷</span>
              <span className="text-base font-bold">Take photo of receipt</span>
            </button>
            <button
              onClick={() => handleCapture('library')}
              className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
              style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '2px solid #1B5FA8' }}
            >
              <span className="text-2xl">🖼️</span>
              <span className="text-base font-bold">Upload from camera roll</span>
            </button>
            <button onClick={onClose} className="text-sm text-center" style={{ color: '#A0AEC0' }}>
              Cancel
            </button>
          </>
        )}

        {/* STAGE: loading */}
        {stage === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-5 py-10">
            <div className="relative w-16 h-16">
              <div
                className="absolute inset-0 rounded-full border-4"
                style={{ borderColor: '#EBF4FB' }}
              />
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

        {/* STAGE: form */}
        {stage === 'form' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#1A7A4A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-base font-extrabold" style={{ color: '#0D2B4E' }}>Receipt read — confirm details</h2>
            </div>

            {/* Receipt preview chip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E2E8F0' }}>
              <span className="text-lg">🧾</span>
              <span className="text-xs font-semibold" style={{ color: '#1B5FA8' }}>{form.receipt} — attached</span>
            </div>

            {/* Fields */}
            {[
              { label: 'Amount', key: 'amount', prefix: '$' },
              { label: 'Date', key: 'date' },
              { label: 'Vendor', key: 'vendor' },
              { label: 'Description', key: 'description' },
            ].map(({ label, key, prefix }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                  {label}
                </label>
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC' }}>
                  {prefix && (
                    <span className="pl-4 text-sm font-bold" style={{ color: '#4A5568' }}>{prefix}</span>
                  )}
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="flex-1 px-3 py-3 text-sm bg-transparent outline-none"
                    style={{ color: '#0D2B4E' }}
                  />
                </div>
              </div>
            ))}

            {/* Category dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
              >
                Confirm and Save
              </button>
              <button
                onClick={() => setStage('pick')}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8' }}
              >
                Edit details
              </button>
            </div>
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

// ── Main screen ───────────────────────────────────────────────────────────────
export default function J2Expenses() {
  const [expenses, setExpenses]   = useState(INITIAL_EXPENSES)
  const [panelOpen, setPanelOpen] = useState(false)
  const [flashCat, setFlashCat]   = useState(null)

  const totals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})

  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0)
  const maxCat     = Math.max(...Object.values(totals))

  function handleSave(form) {
    const amount = parseFloat(form.amount.replace(/,/g, '')) || 0
    const next = {
      id: Date.now(),
      category: form.category,
      amount,
      label: form.description || form.vendor,
      date: form.date,
      isNew: true,
    }
    setExpenses((prev) => [...prev, next])
    setFlashCat(form.category)
    setTimeout(() => setFlashCat(null), 2000)
  }

  // Rebuild totals after potential new expense
  const updatedTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})
  const updatedMax = Math.max(...Object.values(updatedTotals))

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#4A9FD4' }}>
          Chen Family · EB-5 Journey
        </p>
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Total Tracked
            </p>
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: '#FFFFFF' }}>
              ${grandTotal.toLocaleString()}
            </p>
          </div>
          <div className="w-px" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              EB-5 Investment
            </p>
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: '#F0A500' }}>
              $800,000
            </p>
          </div>
        </div>
      </div>

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

        {/* Recent entries */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <p className="text-xs font-extrabold uppercase tracking-widest px-4 pt-4 pb-2" style={{ color: '#4A5568' }}>
            Entries
          </p>
          <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
            {[...expenses].reverse().map((e) => (
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
        </div>

        {/* Export buttons */}
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
          >
            <span>📋</span> Export PDF for attorney
          </button>
          <button
            className="flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
          >
            <span>📊</span> Export for taxes
          </button>
        </div>

      </div>

      {panelOpen && (
        <AddExpensePanel
          onClose={() => setPanelOpen(false)}
          onSave={handleSave}
        />
      )}

      <TabBar active="expenses" />
    </div>
  )
}
