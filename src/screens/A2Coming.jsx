import { useState } from 'react'
import NavFooter from '../components/NavFooter'

const NEEDS_ATTENTION = [
  {
    id: 'chen',
    family: 'Chen Family',
    issues: ['3 documents missing', 'I-94 correction flagged as outstanding'],
  },
  {
    id: 'patel',
    family: 'Patel Family',
    issues: ['Medical exams expired', '2 passports expiring within 90 days'],
  },
]

const CLIENTS = [
  { id: 'chen',     name: 'Chen Family',     done: 18, total: 23, status: 'warning'  },
  { id: 'patel',    name: 'Patel Family',    done: 21, total: 24, status: 'warning'  },
  { id: 'anderson', name: 'Anderson Family', done: 24, total: 24, status: 'complete' },
  { id: 'singh',    name: 'Singh Family',    done: 14, total: 20, status: 'progress' },
  { id: 'morrison', name: 'Morrison, James', done: 19, total: 22, status: 'complete' },
]

const STATUS_COLORS = {
  warning:  { dot: '#F0A500', label: '#92400E', bg: '#FEF3C7', bar: '#F0A500' },
  complete: { dot: '#1A7A4A', label: '#1A7A4A', bg: '#D1FAE5', bar: '#1A7A4A' },
  progress: { dot: '#1B5FA8', label: '#1B5FA8', bg: '#EBF4FB', bar: '#4A9FD4' },
}

const STATUS_LABELS = {
  warning:  'Needs attention',
  complete: 'Complete',
  progress: 'In progress',
}

function ProgressBar({ done, total, color }) {
  const pct = Math.round((done / total) * 100)
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold flex-shrink-0" style={{ color: '#4A5568', minWidth: 40, textAlign: 'right' }}>
        {done} / {total}
      </span>
    </div>
  )
}

function AttentionCard({ client }) {
  return (
    <div className="rounded-2xl px-4 py-4 flex flex-col gap-3"
      style={{ backgroundColor: '#FFFBEB', border: '2px solid #F0A500' }}>
      <div className="flex items-center gap-2">
        <span className="text-base">⚠️</span>
        <p className="text-sm font-extrabold" style={{ color: '#92400E' }}>{client.family}</p>
      </div>
      <div className="flex flex-col gap-1">
        {client.issues.map((issue, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#F0A500' }} />
            <p className="text-sm" style={{ color: '#78350F' }}>{issue}</p>
          </div>
        ))}
      </div>
      <button
        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
        style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
      >
        View client docs →
      </button>
    </div>
  )
}

function ClientRow({ client }) {
  const colors = STATUS_COLORS[client.status]
  return (
    <div className="px-4 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold" style={{ color: '#0D2B4E' }}>{client.name}</p>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: colors.bg, color: colors.label }}>
          {STATUS_LABELS[client.status]}
        </span>
      </div>
      <ProgressBar done={client.done} total={client.total} color={colors.bar} />
    </div>
  )
}

export default function A2Coming() {
  const [toast, setToast] = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const incompleteCount = CLIENTS.filter(c => c.status !== 'complete').length

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 z-50 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold"
          style={{ transform: 'translateX(-50%)', backgroundColor: '#0D2B4E', color: '#FFFFFF', maxWidth: 320, textAlign: 'center' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#1A4A2E' }}>
        <p className="text-xs font-extrabold uppercase tracking-widest mb-0.5" style={{ color: '#FFFFFF', letterSpacing: '0.14em' }}>
          ATTORNEY PORTAL
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>Document Status — All Clients</h1>
        <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Maimone Legal
        </p>
      </div>

      {/* Attorney banner */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#1A7A4A' }}>
        <span className="text-base">⚖️</span>
        <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
          You are viewing the Attorney Dashboard — this is not the client view
        </p>
      </div>

      {/* Attorney legal disclaimer */}
      <div className="px-4 py-2.5" style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <p className="text-xs" style={{ color: '#94A3B8' }}>
          Client data is for case management purposes only. MigraTrak does not provide legal advice.
        </p>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-5 pb-4">

        {/* Needs Attention */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#DC2626' }}>
              Needs Attention
            </p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              {NEEDS_ATTENTION.length} clients
            </span>
          </div>
          {NEEDS_ATTENTION.map(c => <AttentionCard key={c.id} client={c} />)}
        </div>

        {/* All clients table */}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: '#4A5568' }}>
            All Clients
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            {CLIENTS.map(c => <ClientRow key={c.id} client={c} />)}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#4A5568' }}>
            Actions
          </p>
          <button
            onClick={() => showToast('Document request sent to Chen Family')}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
          >
            Request missing docs — Chen Family
          </button>
          <button
            onClick={() => showToast(`Reminders sent to ${incompleteCount} incomplete clients`)}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#0D2B4E', color: '#FFFFFF' }}
          >
            Send reminder — all incomplete clients
          </button>
          <button
            onClick={() => showToast('Compliance report exported')}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#FFFFFF', color: '#1B5FA8', border: '2px solid #1B5FA8' }}
          >
            Export compliance report
          </button>
        </div>

      </div>

      <NavFooter backPath="/a1" />
    </div>
  )
}
