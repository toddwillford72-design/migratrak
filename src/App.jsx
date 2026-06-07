import { BrowserRouter, Routes, Route } from 'react-router-dom'
import D1Landing from './screens/D1Landing'
import D2Coming from './screens/D2Coming'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<D1Landing />} />
        <Route path="/d2" element={<D2Coming />} />
      </Routes>
    </BrowserRouter>
  )
}
