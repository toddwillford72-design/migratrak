import { useNavigate } from 'react-router-dom'

/**
 * Fixed footer with optional Back (ghost) and Next (amber) buttons.
 * backPath  — omit for first screen (D1)
 * onBack    — optional override; called instead of navigate(backPath)
 * nextPath  — omit for last screen (A2)
 * nextLabel — defaults to "Next →"
 * backLabel — defaults to "← Back"
 * onNext    — optional override; called instead of navigate(nextPath)
 */
export default function NavFooter({
  backPath,
  onBack,
  nextPath,
  nextLabel = 'Next →',
  backLabel = '← Back',
  onNext,
  nextDisabled = false,
}) {
  const navigate = useNavigate()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 px-4 py-3"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        boxShadow: '0 -4px 16px rgba(13,43,78,0.08)',
      }}
    >
      {/* Back */}
      {backPath || onBack ? (
        <button
          onClick={onBack ?? (() => navigate(backPath))}
          className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-semibold transition-opacity active:opacity-60"
          style={{ color: '#1B5FA8', backgroundColor: '#EBF4FB' }}
        >
          {backLabel}
        </button>
      ) : (
        /* Spacer so Next stays full-width on D1 */
        <div />
      )}

      {/* Next */}
      {nextPath || onNext ? (
        <button
          onClick={onNext ?? (() => navigate(nextPath))}
          disabled={nextDisabled}
          className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{
            backgroundColor: nextDisabled ? '#E2E8F0' : '#F0A500',
            color: nextDisabled ? '#A0AEC0' : '#0D2B4E',
          }}
        >
          {nextLabel}
        </button>
      ) : (
        <div className="flex-1 py-3 rounded-xl text-center text-sm font-semibold"
          style={{ backgroundColor: '#EBF4FB', color: '#4A5568' }}>
          End of flow
        </div>
      )}
    </div>
  )
}
