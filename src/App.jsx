import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
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

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'

  return (
    <>
      <ScrollToTop />
      {!isLanding && <NavBar onAICoach={() => navigate('/j4')} />}
      <Routes>
        <Route path="/"   element={<D1Landing />} />
        <Route path="/d2" element={<D2Assessment />} />
        <Route path="/d3" element={<D3Results />} />
        <Route path="/d4" element={<D4CostEstimator />} />
        <Route path="/d5" element={<D5Destination />} />
        <Route path="/d6" element={<D5Timeline />} />
        <Route path="/d7" element={<D6Save />} />
        <Route path="/j1" element={<J1Dashboard />} />
        <Route path="/j2" element={<J2Expenses />} />
        <Route path="/j3" element={<J3Documents />} />
        <Route path="/j4" element={<J4Coach />} />
        <Route path="/j5" element={<J5Directory />} />
        <Route path="/j6" element={<J6Essentials />} />
        <Route path="/resources" element={<JResourcesScreen />} />
        <Route path="/a1" element={<A1AttorneyDashboard />} />
        <Route path="/a2" element={<A2Coming />} />
        <Route path="/a3" element={<A3Invite />} />
        <Route path="/attorney-client" element={<AttyClientEntry />} />
      </Routes>
      <GlobalFooter />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
