import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TIERS = [
  { min: 1,   max: 9,   rate: 15 },
  { min: 10,  max: 24,  rate: 12 },
  { min: 25,  max: 49,  rate: 10 },
  { min: 50,  max: 99,  rate: 8  },
  { min: 100, max: null, rate: 6 },
]

function tierRate(count) {
  const t = TIERS.find(t => count >= t.min && (t.max === null || count <= t.max))
  return t ? t.rate : 15
}

function TierTable({ activeCount }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
      <div className="px-4 py-3" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#4A9FD4' }}>Per-client pricing tiers</p>
      </div>
      {TIERS.map((tier, i) => {
        const isActive = activeCount >= tier.min && (tier.max === null || activeCount <= tier.max)
        return (
          <div key={i} className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: isActive ? '#EBF4FB' : '#FFFFFF', borderBottom: i < TIERS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
            <div className="flex items-center gap-2">
              {isActive && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1B5FA8' }} />}
              <p className="text-sm" style={{ color: isActive ? '#0D2B4E' : '#64748B', fontWeight: isActive ? 700 : 400 }}>
                {tier.max ? `${tier.min}–${tier.max} clients` : `${tier.min}+ clients`}
              </p>
              {isActive && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1B5FA8', color: '#FFFFFF' }}>Your tier</span>}
            </div>
            <p className="text-sm font-bold" style={{ color: isActive ? '#1B5FA8' : '#94A3B8' }}>${tier.rate}/client/mo</p>
          </div>
        )
      })}
    </div>
  )
}

export default function A1Billing() {
  const navigate = useNavigate()
  const [profile, setProfile]                 = useState(null)
  const [activeCount, setActiveCount]         = useState(0)
  const [billing, setBilling]                 = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError]                     = useState(null)
  const [toast, setToast]                     = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) { navigate('/auth'); return }
        const userId = session.user.id
        const email  = session.user.email
        const [{ data: userRow }, { count }] = await Promise.all([
          supabase.from('users').select('name, firm_name').eq('id', userId).single(),
          supabase.from('attorney_clients').select('*', { count: 'exact', head: true }).eq('attorney_id', userId).eq('status', 'active'),
        ])
        setProfile({ ...userRow, email })
        setActiveCount(count || 0)
        const res = await fetch('/api/get-billing-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attorneyEmail: email, activeClientCount: count || 0 }),
        })
        if (!res.ok) throw new Error('Could not load billing status')
        setBilling(await res.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  async function handleSubscribe() {
    if (!profile) return
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attorneyEmail: profile.email, attorneyName: profile.name, firmName: profile.firm_name || '', activeClientCount: activeCount }),
      })
      if (!res.ok) throw new Error('Could not create subscription')
      const data = await res.json()
      window.location.href = data.sessionUrl
    } catch (err) {
      showToast('Could not start checkout — ' + err.message)
      setCheckoutLoading(false)
    }
  }

  const rate         = tierRate(activeCount)
  const perClientAmt = activeCount * rate
  const totalAmt     = 49 + perClientAmt
  const isSubscribed = billing?.subscriptionStatus === 'active'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F9FC' }}>
      <p className="text-sm" style={{ color: '#64748B' }}>Loading billing…</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>Could not load billing</p>
        <p className="text-xs mt-1" style={{ color: '#64748B' }}>{error}</p>
        <button onClick={() => navigate('/a1')} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: '#0D2B4E', color: '#FFFFFF' }}>Back to dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      {toast && (
        <div className="fixed top-4 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{ transform: 'translateX(-50%)', backgroundColor: '#0D2B4E', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={() => navigate('/a1')} className="flex items-center gap-1.5 mb-4 transition-opacity active:opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Back to dashboard</span>
        </button>
        <p className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>Attorney Portal</p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>Billing</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{profile?.firm_name || profile?.name || 'Your practice'}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isSubscribed ? '#1A7A4A' : '#F0A500' }} />
          <span className="text-xs font-bold" style={{ color: isSubscribed ? '#4ADE80' : '#FCD34D' }}>
            {isSubscribed ? 'Subscription active' : 'No active subscription — test mode'}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-4 pt-4 pb-24">
        <div className="rounded-2xl px-4 py-3 flex items-start gap-3" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
          <span className="text-base flex-shrink-0">🧪</span>
          <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
            <span className="font-bold">Test mode active.</span> No real charges. Use test card <span className="font-mono font-bold">4242 4242 4242 4242</span> with any future date and any CVC.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#4A5568' }}>This month's bill</p>
          </div>
          <div className="px-4">
            <div className="flex items-start justify-between gap-3 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <div><p className="text-sm font-semibold" style={{ color: '#0D2B4E' }}>Directory listing</p><p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Flat monthly fee — all attorneys</p></div>
              <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>$49.00</p>
            </div>
            <div className="flex items-start justify-between gap-3 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <div><p className="text-sm font-semibold" style={{ color: '#0D2B4E' }}>Per-client fee</p><p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{activeCount} active client{activeCount !== 1 ? 's' : ''} × ${rate}.00/client</p></div>
              <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>${perClientAmt.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between py-4">
              <p className="text-base font-extrabold" style={{ color: '#0D2B4E' }}>Total</p>
              <p className="text-2xl font-extrabold" style={{ color: '#F0A500' }}>${totalAmt.toFixed(2)}<span className="text-sm font-semibold" style={{ color: '#94A3B8' }}>/mo</span></p>
            </div>
          </div>
        </div>
        <TierTable activeCount={activeCount} />
        <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}>
          <p className="text-xs font-extrabold mb-1" style={{ color: '#1B5FA8' }}>How active clients are counted</p>
          <p className="text-xs leading-relaxed" style={{ color: '#1B5FA8' }}>An active client logged into MigraTrak at least once during the billing month. Clients added but not yet activated are not billed.</p>
        </div>
        {isSubscribed ? (
          <div className="rounded-2xl px-4 py-4 flex items-center gap-3" style={{ backgroundColor: '#D1FAE5', border: '1px solid #1A7A4A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#1A7A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div>
              <p className="text-sm font-extrabold" style={{ color: '#1A7A4A' }}>Subscription active</p>
              {billing?.currentPeriodEnd && <p className="text-xs mt-0.5" style={{ color: '#065F46' }}>Next billing: {new Date(billing.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
            </div>
          </div>
        ) : (
          <button onClick={handleSubscribe} disabled={checkoutLoading}
            className="w-full py-4 rounded-2xl text-base font-extrabold transition-all active:scale-95"
            style={{ backgroundColor: checkoutLoading ? '#94A3B8' : '#F0A500', color: '#0D2B4E', opacity: checkoutLoading ? 0.7 : 1 }}>
            {checkoutLoading ? 'Opening checkout…' : `Start subscription — $${totalAmt.toFixed(2)}/mo →`}
          </button>
        )}
        <p className="text-xs text-center" style={{ color: '#94A3B8' }}>Beta clients invoiced manually. Stripe activates for new attorneys after beta.</p>
      </div>
    </div>
  )
}
