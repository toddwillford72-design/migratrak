import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    title: '1. What We Collect',
    bullets: [
      'Account information: name, email, visa type, family composition, destination state',
      'Documents and receipts you upload (passports, financial records, immigration documents)',
      'Usage data: how you interact with the App',
      'Communications with our AI coaching feature',
    ],
  },
  {
    title: '2. How We Use Your Information',
    bullets: [
      "To provide the App's core features (milestone tracking, document storage, expense tracking, AI coaching)",
      'To connect you with attorneys or professionals you choose to engage through the directory',
      "To send you relevant notifications (check-ins, deadline reminders) if you've opted in",
      'To improve the App',
    ],
  },
  {
    title: '3. How We Store Your Data',
    body: 'Your data is stored using Supabase, a secure cloud database provider, with access restricted to your account through row-level security. Uploaded documents are stored in a private file storage bucket and are not publicly accessible.',
  },
  {
    title: '4. Who We Share Your Information With',
    bullets: [
      'Your attorney: If you connect with an attorney through MigraTrak, your relevant case information becomes visible to that attorney within the App.',
      'Service providers: We use third-party services (Supabase for database/storage, Anthropic for AI coaching, Resend for email, Stripe for billing) solely to operate the App. These providers do not have independent rights to use your data.',
      'We do not sell your personal information to third parties.',
    ],
  },
  {
    title: '5. AI Coaching Feature',
    body: "Messages you send to the AI coach are processed by Anthropic's API to generate responses. This is for providing you educational information only and is not stored for any purpose beyond improving your experience in the App.",
  },
  {
    title: '6. Your Rights',
    body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting hello@migratrak.app.',
  },
  {
    title: '7. Data Retention',
    body: 'We retain your data for as long as your account is active. Upon account deletion request, we will permanently delete your data within a reasonable timeframe.',
  },
  {
    title: '8. Security',
    body: 'We use industry-standard measures (private storage, signed URLs, row-level security, encrypted connections) to protect your data. No system is completely secure, and we cannot guarantee absolute security.',
  },
  {
    title: "9. Children's Privacy",
    body: 'MigraTrak is not directed at children under 18. We do not knowingly collect data from children.',
  },
  {
    title: '10. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. Continued use of the App after changes constitutes acceptance of the updated Policy.',
  },
  {
    title: '11. Contact',
    body: 'Questions about this Privacy Policy: hello@migratrak.app',
  },
]

export default function PrivacyScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>Legal</p>
        <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#FFFFFF' }}>Privacy Policy</h1>
        <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Last updated: June 19, 2026</p>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-5 pb-10">
        {SECTIONS.map((s, i) => (
          <div key={i} className="rounded-2xl px-5 py-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <p className="text-sm font-extrabold mb-2" style={{ color: '#0D2B4E' }}>{s.title}</p>
            {s.bullets ? (
              <ul className="flex flex-col gap-1.5">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#4A9FD4' }} />
                    <span className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>{s.body}</p>
            )}
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
