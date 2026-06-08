import NavFooter from '../components/NavFooter'

export default function A2Coming() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#1A4A2E' }}>
        <p className="text-xs font-extrabold uppercase tracking-widest mb-0.5" style={{ color: '#FFFFFF', letterSpacing: '0.14em' }}>
          ATTORNEY PORTAL
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>About & Legal</h1>
        <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Maimone Law — Powered by MigraTrak
        </p>
      </div>
      <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#1A7A4A' }}>
        <span className="text-base">⚖️</span>
        <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
          You are viewing the Attorney Dashboard — this is not the client view
        </p>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 px-6 pb-28">
        <p className="text-sm text-center" style={{ color: '#4A5568' }}>Coming soon</p>
      </div>
      <NavFooter backPath="/a1" />
    </div>
  )
}
