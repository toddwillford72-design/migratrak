import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import D1Landing from './screens/D1Landing'
import D2Coming from './screens/D2Coming'
import NavBar from './components/NavBar'
import './index.css'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'

  return (
    <>
      {!isLanding && (
        <NavBar onAICoach={() => navigate('/ai-coach')} />
      )}
      <Routes>
        <Route path="/" element={<D1Landing />} />
        <Route path="/d2" element={<D2Coming />} />
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
