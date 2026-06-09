import { useNavigate } from 'react-router-dom'
import { VISA_TYPES, DESTINATION } from '../data/config'

const quotes = [
  {
    text: 'My attorney said she\'d never had a client walk in so prepared. MigraTrak made the difference.',
    author: 'James R., London',
  },
  {
    text: 'I finally understood exactly what this move would cost and how long it would take. No more guessing.',
    author: 'Sarah M., Toronto',
  },
]

// Derived from config — not hardcoded
const visaNames = VISA_TYPES.map((v) => v.name).join(', ')

export default function D1Landing() {
  const navigate = useNavigate()
  return (
    <div
      className="flex flex-col items-center justify-center px-6"
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #0D2B4E 0%, #1B5FA8 100%)',
        paddingTop: '2rem',
        paddingBottom: '5.5rem',
      }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-5">

        {/* Logo / wordmark */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: '#4A9FD4' }}
          >
            MigraTrak
          </span>
          <div
            className="w-10 h-0.5 rounded-full"
            style={{ backgroundColor: '#F0A500' }}
          />
        </div>

        {/* Headline */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1
            className="text-[1.75rem] font-bold leading-tight"
            style={{ color: '#FFFFFF' }}
          >
            Thinking about moving to the {DESTINATION}?
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#EBF4FB' }}
          >
            Answer 5 questions. See your realistic visa options, true costs,
            and timeline — before you call anyone.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Covers {visaNames}
          </p>
        </div>

        {/* Testimonials */}
        <div className="flex flex-col gap-3 w-full">
          {quotes.map((q, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
            >
              <p
                className="text-sm leading-snug"
                style={{ color: '#FFFFFF' }}
              >
                "{q.text}"
              </p>
              <p
                className="text-xs font-semibold"
                style={{ color: '#4A9FD4' }}
              >
                — {q.author}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
          No account required · Takes under 2 minutes
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={() => navigate('/d2')}
            className="w-full py-4 rounded-2xl text-base font-extrabold transition-all active:scale-95"
            style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
          >
            Start — it's free →
          </button>
          <div className="w-full h-px" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <button
            onClick={() => navigate('/a1')}
            className="text-xs transition-opacity active:opacity-60"
            style={{ color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            Immigration specialist? Access your portal →
          </button>
        </div>

      </div>
    </div>
  )
}
