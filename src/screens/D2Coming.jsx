import { useNavigate } from 'react-router-dom'

export default function D2Coming() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#EBF4FB' }}
    >
      <p className="text-sm font-semibold mb-2" style={{ color: '#4A9FD4' }}>
        SCREEN D2
      </p>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#0D2B4E' }}>
        Coming soon
      </h2>
      <button
        onClick={() => navigate('/')}
        className="text-sm underline"
        style={{ color: '#1B5FA8' }}
      >
        ← Back to landing
      </button>
    </div>
  )
}
