import { useState } from 'react'

const USCIS_URL = 'https://egov.uscis.gov/casestatus/landing.do'

export default function NavBar({ onAICoach }) {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <>
      <nav
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-50"
        style={{ backgroundColor: '#0D2B4E' }}
      >
        {/* Wordmark */}
        <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#4A9FD4' }}>
          MigraTrak
        </span>

        {/* Right buttons */}
        <div className="flex items-center gap-2">
          {/* USCIS Case Status */}
          <a
            href={USCIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity active:opacity-70"
            style={{ backgroundColor: '#1B5FA8', color: '#FFFFFF' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" />
              <path d="M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            USCIS Status
          </a>

          {/* Help */}
          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity active:opacity-70"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.5" fill="currentColor" />
            </svg>
            Help
          </button>
        </div>
      </nav>

      {/* Help modal */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl px-6 py-8 flex flex-col gap-5"
            style={{ backgroundColor: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold" style={{ color: '#0D2B4E' }}>
              Need help?
            </h2>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4A5568' }}>
                Email us
              </p>
              <a
                href="mailto:hello@migratrak.app"
                className="text-base font-medium"
                style={{ color: '#1B5FA8' }}
              >
                hello@migratrak.app
              </a>
            </div>

            {/* AI Coach link */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4A5568' }}>
                AI Immigration Coach
              </p>
              <button
                onClick={() => { setHelpOpen(false); onAICoach?.() }}
                className="text-left text-base font-medium"
                style={{ color: '#1B5FA8' }}
              >
                Ask the AI Coach →
              </button>
            </div>

            <button
              onClick={() => setHelpOpen(false)}
              className="mt-2 w-full py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#EBF4FB', color: '#0D2B4E' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
