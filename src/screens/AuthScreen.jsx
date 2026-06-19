import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const VISA_OPTIONS = [
  { value: 'eb5',    label: 'EB-5 Investor Visa' },
  { value: 'e2',     label: 'E-2 Treaty Investor' },
  { value: 'tn',     label: 'TN (Canada/Mexico)' },
  { value: 'l1',     label: 'L-1 Intracompany Transfer' },
  { value: 'h1b',    label: 'H-1B Specialty Occupation' },
  { value: 'o1',     label: 'O-1 Extraordinary Ability' },
  { value: 'k1',     label: 'K-1 Fiancé(e) Visa' },
  { value: 'eb2niw', label: 'EB-2 NIW (National Interest Waiver)' },
]

export default function AuthScreen() {
  const navigate = useNavigate()
  const location = useLocation()

  const prefill = location.state || {}
  const isAttorneyPortal = prefill.role === 'attorney'

  // Read query params for invite flow
  const params = new URLSearchParams(window.location.search)
  const isInvite = params.get('invite') === '1'
  const inviteEmail = params.get('email') || ''

  const [mode, setMode] = useState(isInvite ? 'signup' : (prefill.mode || 'signin'))
  const [userType, setUserType] = useState('client') // 'client' | 'attorney'

  // Shared fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState(isInvite ? inviteEmail : '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Client-only fields
  const [visaType, setVisaType] = useState(prefill.visa_type || '')
  const [originCountry, setOriginCountry] = useState('Canada')
  const [destinationState, setDestinationState] = useState(prefill.destination_state || '')

  // Attorney-only field
  const [firmName, setFirmName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    try {
      const signUpOptions = userType === 'client'
        ? {
            email, password,
            options: {
              data: {
                role: 'client',
                name,
                visa_type: visaType || null,
                origin_country: originCountry || 'Canada',
                destination_state: destinationState || null,
                family_size: null,
              }
            }
          }
        : {
            email, password,
            options: {
              data: {
                role: 'attorney',
                name,
                firm_name: firmName || null,
              }
            }
          }

      const { data, error: signUpError } = await supabase.auth.signUp(signUpOptions)
      if (signUpError) throw signUpError

      const role = data.user?.user_metadata?.role || 'client'

      if (role === 'client') {
        try {
          const answers = JSON.parse(localStorage.getItem('migratrak_answers') || '{}')
          const selectedAttorneyId = localStorage.getItem('migratrak_selected_attorney') || null
          await fetch('/api/score-prospect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              visa_type: visaType || answers.visa_type || null,
              budget_range: answers.budget || null,
              destination_state: destinationState || null,
              assessment_answers: answers,
              attorney_id: selectedAttorneyId,
            }),
          })
        } catch {
          // Non-blocking — signup succeeds even if prospect scoring fails
        }
      }

      navigate(role === 'attorney' ? '/a1' : '/j1')
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return }

    setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError

      const userId = data.user?.id
      const { data: userRow } = await supabase.from('users').select('role').eq('id', userId).single()
      const role = userRow?.role || 'client'

      navigate(role === 'attorney' ? '/a1' : '/j1')
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-8 pb-6 text-center" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={() => navigate('/')} className="text-xs mb-4 block" style={{ color: '#4A9FD4' }}>
          ← Back to home
        </button>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#A0B4C8' }}>
          {mode === 'signup' ? 'Start tracking your US immigration journey' : 'Sign in to MigraTrak'}
        </p>
      </div>

      {/* Attorney portal label */}
      {isAttorneyPortal && (
        <p className="text-center mt-4 text-xs font-semibold tracking-widest uppercase" style={{ color: '#4A9FD4' }}>
          Attorney Portal Login
        </p>
      )}

      {/* Mode toggle */}
      <div className="flex mx-5 mt-5 rounded-xl overflow-hidden border" style={{ borderColor: '#E2E8F0' }}>
        <button
          onClick={() => { setMode('signin'); setError('') }}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors"
          style={{
            backgroundColor: mode === 'signin' ? '#0D2B4E' : '#FFFFFF',
            color: mode === 'signin' ? '#FFFFFF' : '#4A5568',
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => { setMode('signup'); setError('') }}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors"
          style={{
            backgroundColor: mode === 'signup' ? '#0D2B4E' : '#FFFFFF',
            color: mode === 'signup' ? '#FFFFFF' : '#4A5568',
          }}
        >
          Sign Up
        </button>
      </div>

      <div className="flex-1 px-5 py-5">

        {/* Sign In form */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF', paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>

            <p className="text-center text-sm" style={{ color: '#4A5568' }}>
              Don't have an account?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError('') }} className="font-semibold" style={{ color: '#1B5FA8' }}>
                Sign up free
              </button>
            </p>
          </form>
        )}

        {/* Sign Up form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">

            {/* User type selector */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4A5568' }}>I am…</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('client')}
                  className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold text-center transition-all"
                  style={{
                    borderColor: userType === 'client' ? '#1B5FA8' : '#E2E8F0',
                    backgroundColor: userType === 'client' ? '#EBF4FB' : '#FFFFFF',
                    color: userType === 'client' ? '#1B5FA8' : '#4A5568',
                  }}
                >
                  Moving to the US
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('attorney')}
                  className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold text-center transition-all"
                  style={{
                    borderColor: userType === 'attorney' ? '#1B5FA8' : '#E2E8F0',
                    backgroundColor: userType === 'attorney' ? '#EBF4FB' : '#FFFFFF',
                    color: userType === 'attorney' ? '#1B5FA8' : '#4A5568',
                  }}
                >
                  Immigration Professional
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF', paddingRight: 44 }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Client-specific fields */}
            {userType === 'client' && (
              <>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Visa type</label>
                  <select
                    value={visaType}
                    onChange={e => setVisaType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="">Select visa type (optional)</option>
                    {VISA_OPTIONS.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Origin country</label>
                  <input
                    type="text"
                    value={originCountry}
                    onChange={e => setOriginCountry(e.target.value)}
                    placeholder="Canada"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Destination state (optional)</label>
                  <input
                    type="text"
                    value={destinationState}
                    onChange={e => setDestinationState(e.target.value)}
                    placeholder="Not sure yet"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                  />
                </div>
              </>
            )}

            {/* Attorney-specific field */}
            {userType === 'attorney' && (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Firm name</label>
                <input
                  type="text"
                  value={firmName}
                  onChange={e => setFirmName(e.target.value)}
                  placeholder="Your law firm (optional)"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                />
              </div>
            )}

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                {error}
              </p>
            )}

            <p className="text-xs leading-relaxed" style={{ color: '#718096' }}>
              By creating an account you agree to our Terms of Service. MigraTrak provides educational information only — not legal advice.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
            >
              {loading ? 'Creating account…' : 'Create free account →'}
            </button>

            <p className="text-center text-sm" style={{ color: '#4A5568' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('signin'); setError('') }} className="font-semibold" style={{ color: '#1B5FA8' }}>
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
