import { useState, useEffect } from 'react'
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
  const [mode, setMode] = useState(prefill.mode || 'signin') // 'signin' | 'signup'
  const [userType, setUserType] = useState('client') // 'client' | 'attorney'

  // Shared fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Client-only fields
  const [visaType, setVisaType] = useState(prefill.visa_type || '')
  const [originCountry, setOriginCountry] = useState('Canada')
  const [destinationState, setDestinationState] = useState(prefill.destination_state || '')

  // Attorney-only field
  const [firmName, setFirmName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (prefill.mode === 'signup') setMode('signup')
    if (prefill.visa_type) setVisaType(prefill.visa_type)
  }, [])

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    try {
      const signUpOptions = userType === 'attorney'
        ? { email, password, options: { data: { role: 'attorney' } } }
        : { email, password }

      const { data, error: signUpError } = await supabase.auth.signUp(signUpOptions)
      if (signUpError) throw signUpError

      const userId = data.user?.id
      if (!userId) throw new Error('No user ID returned from signup.')

      // Trigger already inserted the row — update the profile fields
      const profileUpdate = userType === 'client'
        ? {
            name,
            visa_type: visaType || null,
            origin_country: originCountry || 'Canada',
            destination_state: destinationState || null,
          }
        : {
            name,
            role: 'attorney',
            firm_name: firmName || null,
          }

      const { error: updateError } = await supabase.from('users').update(profileUpdate).eq('id', userId)
      if (updateError) throw updateError

      navigate(userType === 'attorney' ? '/a1' : '/j1')
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
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                autoComplete="current-password"
              />
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
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                autoComplete="new-password"
              />
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
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Destination state</label>
                  <input
                    type="text"
                    value={destinationState}
                    onChange={e => setDestinationState(e.target.value)}
                    placeholder="e.g. Florida"
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
