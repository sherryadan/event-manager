import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/')
      } else {
        setUser(data.session.user)
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out!')
    router.push('/')
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-4 text-black">Welcome, {user.email}</h1>
        <p className="text-gray-600 mb-6 text-black">You are logged in to your dashboard.</p>
        <button
          onClick={handleLogout}
          className="bg-red-600 cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
