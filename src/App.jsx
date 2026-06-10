import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import D1Landing from './screens/D1Landing'
import D2Assessment from './screens/D2Assessment'
import D3Results from './screens/D3Results'
import D4CostEstimator from './screens/D4CostEstimator'
import D5Destination from './screens/D5Destination'
import D5Timeline from './screens/D5Timeline'
import D6Save from './screens/D6Save'
import J1Dashboard from './screens/J1Dashboard'
import J2Expenses from './screens/J2Expenses'
import J3Documents from './screens/J3Documents'
import J4Coach from './screens/J4Coach'
import J5Directory from './screens/J5Directory'
import J6Essentials from './screens/J6Essentials'
import JResourcesScreen from './screens/JResourcesScreen'
import A1AttorneyDashboard from './screens/A1AttorneyDashboard'
import A2Coming from './screens/A2Coming'
import A3Invite from './screens/A3Invite'
import AttyClientEntry from './screens/AttyClientEntry'
import NavBar from './components/NavBar'
import AuthScreen from './screens/AuthScreen'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function GlobalFooter() {
  return (
    <div className="w-full px-4 py-3 text-center" style={{ backgroundColor: '#F1F5F9', borderTop: '1px solid #E2E8F0' }}>
      <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
        MigraTrak provides educational information only — not legal advice. Always consult a qualified immigration attorney for guidance specific to your situation.
      </p>
    </div>
  )
}

async function getDashboardPath(userId) {
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role === 'attorney' ? '/a1' : '/j1'
}

function Layout({ authReady, authedPath }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'
  const isAuth = location.pathname === '/auth'

  // Redirect / to dashboard when session exists
  useEffect(() => {
    console.log('Layout effect:', { authReady, authedPath, pathname: location.pathname })
    if (authReady && authedPath && location.pathname === '/') {
      navigate(authedPath, { replace: true })
    }
  }, [authReady, authedPath, location.pathname])

  // Show blank while we figure out where the user should go from /
  if (!authReady) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="text-sm" style={{ color: '#4A5568' }}>Loading…</div>
    </div>
  )

  return (
    <>
      <ScrollToTop />
      {!isLanding && !isAuth && <NavBar onAICoach={() => navigate('/j4')} />}
      <Routes>
        <Route path="/"   element={<D1Landing />} />
        <Route path="/d2" element={<D2Assessment />} />
        <Route path="/d3" element={<D3Results />} />
        <Route path="/d4" element={<D4CostEstimator />} />
        <Route path="/d5" element={<D5Destination />} />
        <Route path="/d6" element={<D5Timeline />} />
        <Route path="/d7" element={<D6Save />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/j1" element={<ProtectedRoute allowedRole="client"><J1Dashboard /></ProtectedRoute>} />
        <Route path="/j2" element={<ProtectedRoute allowedRole="client"><J2Expenses /></ProtectedRoute>} />
        <Route path="/j3" element={<ProtectedRoute allowedRole="client"><J3Documents /></ProtectedRoute>} />
        <Route path="/j4" element={<ProtectedRoute allowedRole="client"><J4Coach /></ProtectedRoute>} />
        <Route path="/j5" element={<ProtectedRoute allowedRole="client"><J5Directory /></ProtectedRoute>} />
        <Route path="/j6" element={<ProtectedRoute allowedRole="client"><J6Essentials /></ProtectedRoute>} />
        <Route path="/resources" element={
          <div style={{ minHeight: '100vh', backgroundColor: '#F7F9FC', padding: 20 }}>
            <p style={{ color: '#0D2B4E', fontSize: 16, fontWeight: 'bold' }}>Resources screen test</p>
          </div>
        } />
        <Route path="/a1" element={<ProtectedRoute allowedRole="attorney"><A1AttorneyDashboard /></ProtectedRoute>} />
        <Route path="/a2" element={<ProtectedRoute allowedRole="attorney"><A2Coming /></ProtectedRoute>} />
        <Route path="/a3" element={<ProtectedRoute allowedRole="attorney"><A3Invite /></ProtectedRoute>} />
        <Route path="/attorney-client" element={<AttyClientEntry />} />
      </Routes>
      <GlobalFooter />
    </>
  )
}

export default function App() {
  const [authReady, setAuthReady] = useState(false)
  const [authedPath, setAuthedPath] = useState(null) // '/j1' | '/a1' | null

  useEffect(() => {
    // Check session on first load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const path = await getDashboardPath(session.user.id)
        setAuthedPath(path)
      }
      setAuthReady(true)
    })

    // Listen for sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const path = await getDashboardPath(session.user.id)
        setAuthedPath(path)
      }
      if (event === 'SIGNED_OUT') {
        setAuthedPath(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Layout authReady={authReady} authedPath={authedPath} />
    </BrowserRouter>
  )
}
