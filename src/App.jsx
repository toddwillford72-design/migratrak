import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import D1Landing from './screens/D1Landing'
import D2Assessment from './screens/D2Assessment'
import D3Results from './screens/D3Results'
import J5Coming from './screens/J5Coming'
import NavBar from './components/NavBar'
import './index.css'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'

  return (
    <>
      {!isLanding && <NavBar onAICoach={() => navigate('/ai-coach')} />}
      <Routes>
        <Route path="/" element={<D1Landing />} />
        <Route path="/d2" element={<D2Assessment />} />
        <Route path="/d3" element={<D3Results />} />
        <Route path="/j5" element={<J5Coming />} />
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
