import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavFooter from '../components/NavFooter'

export default function A3Invite() {
  const navigate = useNavigate()
  const [toastVisible, setToastVisible] = useState(false)

  function handleSend() {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#1A4A2E' }}>
        <p className="text-xs font-extrabold uppercase tracking-widest mb-0.5" style={{ color: '#FFFFFF', letterSpacing: '0.14em' }}>
          ATTORNEY PORTAL
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>Send Client Invitation</h1>
        <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Maimone Legal
        </p>
      </div>

      {/* Attorney banner */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#1A7A4A' }}>
        <span className="text-base">⚖️</span>
        <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
          You are viewing the Attorney Dashboard — this is not the client view
        </p>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">

        {/* Email preview card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Email metadata */}
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #E2E8F0' }}>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <span className="text-xs font-semibold w-14 flex-shrink-0" style={{ color: '#4A5568' }}>From:</span>
                <span className="text-xs" style={{ color: '#4A5568' }}>Maimone Legal (via MigraTrak)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-semibold w-14 flex-shrink-0" style={{ color: '#4A5568' }}>To:</span>
                <span className="text-xs italic" style={{ color: '#A0AEC0' }}>(recipient)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-semibold w-14 flex-shrink-0" style={{ color: '#4A5568' }}>Subject:</span>
                <span className="text-xs font-bold" style={{ color: '#0D2B4E' }}>Your immigration journey just got easier</span>
              </div>
            </div>
          </div>

          {/* Email body */}
          <div className="px-5 py-5 flex flex-col gap-4">
            <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
              Hi [First name],
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
              Your immigration attorney, Anthony Maimone at Maimone Law, has set up a personalized MigraTrak account for you.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
              MigraTrak will walk you through your visa pathway options, show you realistic timelines and costs, and give you a place to track every step of your journey — all in one place.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
              You can access everything — your documents, your timeline, your checklist, and a 24/7 AI coaching tool — with one tap.
            </p>

            {/* CTA button */}
            <button
              className="w-full py-4 rounded-2xl text-base font-extrabold transition-all active:scale-95"
              style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
            >
              Access your MigraTrak account →
            </button>

            <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
              This link is personalized for you. If you have questions before your first consultation, the AI Coach inside MigraTrak can answer most of them.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
              We look forward to working with you.
            </p>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#0D2B4E' }}>— Anthony Maimone</p>
              <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>Maimone Law</p>
              <p className="text-xs" style={{ color: '#4A5568' }}>(via MigraTrak)</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <button
          onClick={handleSend}
          className="w-full py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
        >
          Send invitation
        </button>

        <button
          onClick={() => navigate('/a1')}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
          style={{ backgroundColor: 'transparent', color: '#0D2B4E', border: '2px solid #CBD5E0' }}
        >
          ← Back to dashboard
        </button>

      </div>

      {/* Toast */}
      {toastVisible && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl z-50"
          style={{ backgroundColor: '#1A7A4A', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
        >
          <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#FFFFFF' }}>
            Invitation sent to client
          </p>
        </div>
      )}

      <NavFooter backPath="/a1" />
    </div>
  )
}
