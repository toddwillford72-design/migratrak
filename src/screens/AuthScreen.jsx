import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
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

const VISA_TYPES_HANDLED = ['E-2', 'EB-5', 'TN', 'L-1', 'H-1B', 'O-1', 'K-1', 'EB-2 NIW']

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

  // Attorney-only fields
  const [firmName, setFirmName] = useState('')
  const [officeAddress, setOfficeAddress] = useState('')
  const [officeCity, setOfficeCity] = useState('')
  const [officeState, setOfficeState] = useState('')
  const [visaTypesHandled, setVisaTypesHandled] = useState([])
  const [barNumber, setBarNumber] = useState('')
  const [barState, setBarState] = useState('')
  const [phone, setPhone] = useState('')
  const [languagesSpoken, setLanguagesSpoken] = useState('')

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleVisaType(v) {
    setVisaTypesHandled(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!termsAccepted) { setError('Please accept the Terms of Service and Privacy Policy to continue.'); return }

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userType,
            name,
          }
        }
      })
      if (signUpError) throw signUpError

      // Explicitly insert the users row — there is no DB trigger for this.
      // For clients, status = 'active'. For attorneys, status = 'pending_review'
      // (attorney won't appear in public directory until manually approved).
      const userId = data.user?.id
      if (userId) {
        const usersRow = userType === 'client'
          ? {
              id: userId,
              email,
              name,
              role: 'client',
              status: 'active',
              visa_type: visaType || null,
              origin_country: originCountry || 'Canada',
              destination_state: destinationState || null,
              family_size: null,
            }
          : {
              id: userId,
              email,
              name,
              role: 'attorney',
              status: 'pending_review',
              firm_name: firmName || null,
              office_address: officeAddress || null,
              office_city: officeCity || null,
              office_state: officeState || null,
              visa_types_handled: visaTypesHandled.length > 0 ? visaTypesHandled : null,
              bar_number: barNumber || null,
              bar_state: barState || null,
              phone: phone || null,
              languages_spoken: languagesSpoken || null,
            }
        const { error: profileError } = await supabase
          .from('users')
          .upsert(usersRow, { onConflict: 'id' })
        if (profileError) console.error('Profile row insert failed:', profileError)
      }

      if (userType === 'client') {
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

  const eyeOpen = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
  const eyeOff = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword(v => !v)}
      style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0' }}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? eyeOff : eyeOpen}
    </button>
  )

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
                {passwordToggle}
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
              Don&apos;t have an account?{' '}
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

            {/* Shared: name */}
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

            {/* Shared: email */}
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

            {/* Shared: password */}
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
                {passwordToggle}
              </div>
            </div>

            {/* ── Client-specific fields ── */}
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
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Destination state <span style={{ color: '#A0AEC0', fontWeight: 400 }}>(optional)</span></label>
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

            {/* ── Attorney-specific fields ── */}
            {userType === 'attorney' && (
              <>
                {/* Practice name */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Practice / firm name</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={e => setFirmName(e.target.value)}
                    placeholder="Your law firm or practice name"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                  />
                </div>

                {/* Office address */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Office address <span style={{ color: '#A0AEC0', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="text"
                    value={officeAddress}
                    onChange={e => setOfficeAddress(e.target.value)}
                    placeholder="123 Main St, Suite 100"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                  />
                </div>

                {/* City + State */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>City <span style={{ color: '#A0AEC0', fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="text"
                      value={officeCity}
                      onChange={e => setOfficeCity(e.target.value)}
                      placeholder="Miami"
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                      style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                  <div style={{ width: 90 }}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>State</label>
                    <input
                      type="text"
                      value={officeState}
                      onChange={e => setOfficeState(e.target.value)}
                      placeholder="FL"
                      maxLength={2}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                      style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                </div>

                {/* Visa types handled */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#0D2B4E' }}>Visa types handled <span style={{ color: '#A0AEC0', fontWeight: 400 }}>(select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {VISA_TYPES_HANDLED.map(v => {
                      const selected = visaTypesHandled.includes(v)
                      return (
                        <button
                          type="button"
                          key={v}
                          onClick={() => toggleVisaType(v)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
                          style={{
                            backgroundColor: selected ? '#1B5FA8' : '#F1F5F9',
                            color: selected ? '#FFFFFF' : '#4A5568',
                            border: '1px solid ' + (selected ? '#1B5FA8' : '#E2E8F0'),
                          }}
                        >
                          {v}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Bar number + Bar state */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Bar number <span style={{ color: '#A0AEC0', fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="text"
                      value={barNumber}
                      onChange={e => setBarNumber(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                      style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                  <div style={{ width: 90 }}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Bar state</label>
                    <input
                      type="text"
                      value={barState}
                      onChange={e => setBarState(e.target.value)}
                      placeholder="FL"
                      maxLength={2}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                      style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Phone <span style={{ color: '#A0AEC0', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                  />
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#0D2B4E' }}>Languages spoken <span style={{ color: '#A0AEC0', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="text"
                    value={languagesSpoken}
                    onChange={e => setLanguagesSpoken(e.target.value)}
                    placeholder="e.g. English, Spanish, French"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' }}
                  />
                </div>

                {/* Pending review notice */}
                <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D' }}>
                  <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
                    <strong>Profile review:</strong> Your account will be active immediately. Your profile will appear in the public specialist directory after a brief manual review by the MigraTrak team.
                  </p>
                </div>
              </>
            )}

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                {error}
              </p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
                style={{ width: 18, height: 18, accentColor: '#1B5FA8' }}
              />
              <span className="text-xs leading-relaxed" style={{ color: '#718096' }}>
                I have read and agree to the{' '}
                <Link to="/terms" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: '#1B5FA8' }}>
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: '#1B5FA8' }}>
                  Privacy Policy
                </Link>
                . MigraTrak provides educational information only — not legal advice.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !termsAccepted}
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
