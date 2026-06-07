import { useNavigate } from 'react-router-dom'

const quotes = [
  {
    text: 'Finally — someone explained the E-2 visa in plain English.',
    author: 'Sarah M., Toronto',
  },
  {
    text: 'The cost estimator alone saved me from making a $50,000 mistake.',
    author: 'David K., Vancouver',
  },
  {
    text: 'I wish this existed when we started our EB-5 journey.',
    author: 'The Chen Family, Punta Gorda FL',
  },
]

export default function D1Landing() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{
        background: 'linear-gradient(160deg, #0D2B4E 0%, #1B5FA8 100%)',
      }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

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
        <div className="flex flex-col items-center gap-4 text-center">
          <h1
            className="text-[2.1rem] font-bold leading-tight"
            style={{ color: '#FFFFFF' }}
          >
            Thinking about moving to the USA?
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: '#EBF4FB' }}
          >
            Answer 5 questions. See your realistic visa options, true costs,
            and timeline — before you call anyone.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/d2')}
          className="w-full py-4 rounded-2xl text-lg font-bold tracking-wide transition-transform active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
        >
          Start — it's free
        </button>

        {/* Testimonials */}
        <div className="flex flex-col gap-4 w-full pt-2">
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

      </div>
    </div>
  )
}
