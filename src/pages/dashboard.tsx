import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/')
      } else {
        setUser(data.session.user)
        setLoading(false)
      }
    }
    getSession()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
      <button onClick={handleLogout} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Logout</button>
    </div>
  )
}
