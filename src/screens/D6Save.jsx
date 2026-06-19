import { useNavigate } from 'react-router-dom'

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

export default function D6Save() {
  const navigate = useNavigate()

  function handleCreate() {
    const visa = localStorage.getItem('migratrak_visa') || ''
    const dest = localStorage.getItem('migratrak_destination') || ''
    navigate('/auth', {
      state: { mode: 'signup', visa_type: visa, destination_state: dest }
    })
  }

  function handleChooseAttorney() {
    const visa = localStorage.getItem('migratrak_visa') || ''
    const dest = localStorage.getItem('migratrak_destination') || ''
    navigate('/j5', {
      state: { presignup: true, visa_type: visa, destination_state: dest }
    })
  }

  function handleSignIn() {
    navigate('/auth', { state: { mode: 'signin' } })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          Almost there
        </p>
        <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#FFFFFF' }}>
          Your personalized roadmap is ready
        </h1>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-5 pb-6">

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

        {/* Choose attorney first — secondary CTA */}
        <button
          onClick={handleChooseAttorney}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#FFFFFF', color: '#0D2B4E', border: '2px solid #0D2B4E' }}
        >
          Choose your immigration specialist →
        </button>

        {/* Primary CTA */}
        <button
          onClick={handleCreate}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
        >
          Create your account →
        </button>

        <p className="text-xs text-center px-1" style={{ color: '#A0AEC0' }}>
          Not sure yet? Create your account now — you can choose an attorney anytime from your dashboard.
        </p>

        {/* Sign in link */}
        <p className="text-sm text-center" style={{ color: '#4A5568' }}>
          Already have an account?{' '}
          <button
            onClick={handleSignIn}
            className="font-semibold underline"
            style={{ color: '#1B5FA8' }}
          >
            Sign in
          </button>
        </p>

      </div>

      {/* Back link */}
      <div className="px-4 pb-10 text-center">
        <button
          onClick={() => navigate('/d6')}
          className="text-sm"
          style={{ color: '#A0AEC0' }}
        >
          ← Back to timeline
        </button>
      </div>

    </div>
  )
}
