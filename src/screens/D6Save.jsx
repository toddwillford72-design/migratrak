import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavFooter from '../components/NavFooter'

const FEATURES = [
  'Step-by-step visa pathway guidance',
  'Track every expense from day one',
  'Never miss a critical immigration deadline',
  'Full life setup checklist — banking, healthcare, vehicle, utilities and more',
  'Find vetted specialists in every category',
  'Build your US credit history from day one',
  'Ask our AI coach anything, anytime',
  'Document vault — everything in one place',
]

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="12" fill="#1A7A4A" />
      <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SuccessState({ email, onContinue }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-6">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#D1FAE5' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#1A7A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-extrabold" style={{ color: '#0D2B4E' }}>
          You're in!
        </h2>
        <p className="text-sm mt-1" style={{ color: '#4A5568' }}>
          Account created for
        </p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: '#1B5FA8' }}>
          {email}
        </p>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>
        Your roadmap has been saved. We'll send you a confirmation with your visa pathways and next steps.
      </p>
      <button
        onClick={onContinue}
        className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
        style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
      >
        Go to my dashboard →
      </button>
    </div>
  )
}

export default function D6Save() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const visa = localStorage.getItem('migratrak_visa') || ''
    const dest = localStorage.getItem('migratrak_destination') || ''
    navigate('/auth', {
      state: {
        mode: 'signup',
        visa_type: visa,
        destination_state: dest,
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          Almost there
        </p>
        <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#FFFFFF' }}>
          Your complete US relocation companion is ready
        </h1>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-5 pb-28">

        {/* Feature list */}
        <div
          className="rounded-2xl px-5 py-5 flex flex-col gap-3"
          style={{ backgroundColor: '#FFFFFF', border: '2px solid #E2E8F0' }}
        >
          {FEATURES.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckIcon />
              <span className="text-sm font-medium" style={{ color: '#0D2B4E' }}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Legal disclaimer */}
        <p className="text-xs leading-relaxed px-1" style={{ color: '#94A3B8' }}>
          By creating an account you acknowledge that MigraTrak provides educational information only and does not constitute legal advice, attorney-client relationship, or immigration consultation services.
        </p>

        {/* Form or success */}
        <div
          className="rounded-2xl px-5 py-5"
          style={{ backgroundColor: '#FFFFFF', border: '2px solid #E2E8F0' }}
        >
          {submitted ? (
            <SuccessState email={email} onContinue={() => navigate('/j1')} />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div>
                <h2 className="text-base font-extrabold mb-0.5" style={{ color: '#0D2B4E' }}>
                  Create free account
                </h2>
                <p className="text-xs" style={{ color: '#4A5568' }}>
                  Email and name only — no credit card required.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                    Your name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 rounded-xl text-sm outline-none transition-all"
                    style={{
                      height: 48,
                      border: '2px solid #E2E8F0',
                      backgroundColor: '#F7F9FC',
                      color: '#0D2B4E',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1B5FA8'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 rounded-xl text-sm outline-none transition-all"
                    style={{
                      height: 48,
                      border: '2px solid #E2E8F0',
                      backgroundColor: '#F7F9FC',
                      color: '#0D2B4E',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1B5FA8'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
                style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
              >
                Start my relocation journey — it's free →
              </button>
            </form>
          )}
        </div>

        {!submitted && (
          <>
            {/* Divider */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex-1 h-px" style={{ backgroundColor: '#E2E8F0' }} />
              <span className="text-xs font-semibold" style={{ color: '#A0AEC0' }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#E2E8F0' }} />
            </div>

            {/* Skip link */}
            <button
              onClick={() => navigate('/j5')}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity active:opacity-60"
              style={{ color: '#1B5FA8', backgroundColor: '#EBF4FB' }}
            >
              Maybe later — just show me the directory
            </button>

            {/* Sign in */}
            <p className="text-xs text-center" style={{ color: '#A0AEC0' }}>
              Already using MigraTrak?{' '}
              <button
                className="font-semibold underline"
                style={{ color: '#1B5FA8' }}
                onClick={() => {}}
              >
                Sign in
              </button>
            </p>
          </>
        )}

      </div>

      {!submitted && (
        <NavFooter backPath="/d6" nextPath="/j1" nextLabel="Skip to dashboard →" />
      )}
    </div>
  )
}
