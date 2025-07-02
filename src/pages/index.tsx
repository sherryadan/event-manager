import { useState } from 'react'
import { createClient } from '../../lib/supabase/component'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'


export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Login successful!')
      router.push('/events/')
    }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Log In</h2>
        <form onSubmit={handleLogin} className="space-y-4 text-black">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg text-black"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button className="w-full bg-green-600 cursor-pointer text-white py-3 rounded-lg hover:bg-green-700 transition">
            Log In
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-black">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline cursor-pointer">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
