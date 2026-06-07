import NavFooter from '../components/NavFooter'

export default function J6Coming() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-28" style={{ backgroundColor: '#EBF4FB' }}>
      <p className="text-sm font-semibold mb-2" style={{ color: '#4A9FD4' }}>SCREEN J6</p>
      <h2 className="text-2xl font-bold mb-2" style={{ color: '#0D2B4E' }}>Reminders & Alerts</h2>
      <p className="text-sm text-center" style={{ color: '#4A5568' }}>Coming soon</p>
      <NavFooter backPath="/j5" nextPath="/a1" nextLabel="Next →" />
    </div>
  )
}
