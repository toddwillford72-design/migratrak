import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using MigraTrak ("the App"), you agree to these Terms of Service. If you do not agree, do not use the App.',
  },
  {
    title: '2. Not Legal Advice',
    body: "MigraTrak provides educational and organizational tools related to U.S. immigration processes. MigraTrak is not a law firm, does not provide legal advice, and using the App does not create an attorney-client relationship between you and MigraTrak or any attorney listed in the App's directory. The AI coaching feature provides general educational information only and is not a substitute for consultation with a licensed immigration attorney. You should confirm all case-specific decisions with a qualified attorney.",
  },
  {
    title: '3. No Guarantee of Outcome',
    body: 'MigraTrak does not guarantee any visa approval, processing time, or immigration outcome. Information about processing times, requirements, and procedures is provided for general guidance and may not reflect current USCIS or government policy. You are responsible for verifying current requirements with official government sources (uscis.gov) or your attorney.',
  },
  {
    title: '4. Your Account',
    body: 'You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You must provide accurate information when creating your account.',
  },
  {
    title: '5. Documents and Data You Upload',
    body: 'You retain ownership of any documents, receipts, or personal information you upload. By uploading content, you grant MigraTrak permission to store and display that content back to you, and to your attorney if you have connected with one through the App, solely for the purpose of providing the service.',
  },
  {
    title: '6. Attorney Directory',
    body: "MigraTrak's professional directory lists immigration attorneys and other professionals for informational purposes. Listing in the directory does not constitute an endorsement or guarantee of any professional's services. Your engagement with any attorney or professional is a separate relationship between you and that professional, governed by their own terms.",
  },
  {
    title: '7. Account Deletion',
    body: 'You may request deletion of your account and associated data at any time by contacting hello@migratrak.app. We will permanently delete your data within a reasonable timeframe upon request.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'MigraTrak is provided "as is" without warranties of any kind. To the maximum extent permitted by law, MigraTrak and FieldCore Holdings shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App, including but not limited to immigration outcomes, missed deadlines, or data loss.',
  },
  {
    title: '9. Changes to These Terms',
    body: 'We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the updated Terms.',
  },
  {
    title: '10. Contact',
    body: 'Questions about these Terms: hello@migratrak.app',
  },
]

export default function TermsScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>Legal</p>
        <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#FFFFFF' }}>Terms of Service</h1>
        <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Last updated: June 19, 2026</p>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-5 pb-10">
        {SECTIONS.map((s, i) => (
          <div key={i} className="rounded-2xl px-5 py-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <p className="text-sm font-extrabold mb-2" style={{ color: '#0D2B4E' }}>{s.title}</p>
            <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>{s.body}</p>
          </div>
        ))}

        <p className="text-xs text-center leading-relaxed" style={{ color: '#94A3B8' }}>
          © 2026 MigraTrak — FieldCore Holdings. All rights reserved.
        </p>
        <button onClick={() => window.history.length <= 1 ? navigate('/') : navigate(-1)} className="text-sm text-center" style={{ color: '#A0AEC0' }}>
          ← Back
        </button>
      </div>
    </div>
  )
}
