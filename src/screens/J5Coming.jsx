import { useNavigate } from 'react-router-dom'

export default function J5Coming() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#EBF4FB' }}>
      <p className="text-sm font-semibold mb-2" style={{ color: '#4A9FD4' }}>SCREEN J5</p>
      <h2 className="text-2xl font-bold mb-2" style={{ color: '#0D2B4E' }}>Attorney Connect</h2>
      <p className="text-sm mb-6 text-center" style={{ color: '#4A5568' }}>Coming soon</p>
      <button onClick={() => navigate(-1)} className="text-sm underline" style={{ color: '#1B5FA8' }}>
        ← Back
      </button>
    </div>
  )
}
