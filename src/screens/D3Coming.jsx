import { useNavigate, useLocation } from 'react-router-dom'

export default function D3Coming() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const answers = state?.answers ?? {}
  const hasAgeAlert = answers.children === 'Yes — aged 18, 19, or 20'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#EBF4FB' }}
    >
      {hasAgeAlert && (
        <div
          className="w-full max-w-sm rounded-xl px-4 py-3 mb-6 flex gap-2 items-start"
          style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}
        >
          <span className="text-lg">⚠️</span>
          <p className="text-sm font-semibold" style={{ color: '#991B1B' }}>
            Important: Children aged 18–20 may age out of dependent status during visa processing. Your attorney needs to know this immediately.
          </p>
        </div>
      )}
      <p className="text-sm font-semibold mb-2" style={{ color: '#4A9FD4' }}>SCREEN D3</p>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#0D2B4E' }}>Coming soon</h2>
      <button onClick={() => navigate('/d2')} className="text-sm underline" style={{ color: '#1B5FA8' }}>
        ← Back to assessment
      </button>
    </div>
  )
}
