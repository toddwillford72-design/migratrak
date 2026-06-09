import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AttyClientEntry() {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('migratrak_loggedin', 'true')
    localStorage.setItem(
      'migratrak_answers',
      JSON.stringify({
        country: 'Canada',
        motivation: 'Buying or starting a business',
        household: 'Me, spouse, and children',
        children: 'Yes — under 18',
        budget: 'Over $800,000',
      })
    )
    localStorage.setItem('migratrak_destination', 'Punta Gorda, FL')
    navigate('/j1')
  }, [])

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#0D2B4E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 600 }}>
        Loading your MigraTrak account...
      </p>
    </div>
  )
}
