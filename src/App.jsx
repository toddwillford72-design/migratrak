import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import D1Landing from './screens/D1Landing'
import D2Assessment from './screens/D2Assessment'
import D3Results from './screens/D3Results'
import D4CostEstimator from './screens/D4CostEstimator'
import D5Timeline from './screens/D5Timeline'
import D6Save from './screens/D6Save'
import J1Coming from './screens/J1Coming'
import J2Coming from './screens/J2Coming'
import J3Coming from './screens/J3Coming'
import J4Coming from './screens/J4Coming'
import J5Coming from './screens/J5Coming'
import J6Coming from './screens/J6Coming'
import A1Coming from './screens/A1Coming'
import A2Coming from './screens/A2Coming'
import NavBar from './components/NavBar'
import './index.css'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'

  return (
    <>
      {!isLanding && <NavBar onAICoach={() => navigate('/j4')} />}
      <Routes>
        <Route path="/" element={<D1Landing />} />
        <Route path="/d2" element={<D2Assessment />} />
        <Route path="/d3" element={<D3Results />} />
        <Route path="/d4" element={<D4CostEstimator />} />
        <Route path="/d5" element={<D5Timeline />} />
        <Route path="/d6" element={<D6Save />} />
        <Route path="/j1" element={<J1Coming />} />
        <Route path="/j2" element={<J2Coming />} />
        <Route path="/j3" element={<J3Coming />} />
        <Route path="/j4" element={<J4Coming />} />
        <Route path="/j5" element={<J5Coming />} />
        <Route path="/j6" element={<J6Coming />} />
        <Route path="/a1" element={<A1Coming />} />
        <Route path="/a2" element={<A2Coming />} />
      </Routes>
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
