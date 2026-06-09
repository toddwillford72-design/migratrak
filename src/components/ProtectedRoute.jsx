import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children, allowedRole }) {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate('/', { replace: true })
        return
      }

      if (allowedRole) {
        const { data: userRow } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        const role = userRow?.role || 'client'
        if (role !== allowedRole) {
          navigate(role === 'attorney' ? '/a1' : '/j1', { replace: true })
          return
        }
      }

      setChecking(false)
    })
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="text-sm" style={{ color: '#4A5568' }}>Loading…</div>
      </div>
    )
  }

  return children
}
