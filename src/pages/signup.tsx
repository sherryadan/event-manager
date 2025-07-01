import { useState } from 'react'
import { createClient } from '../../lib/supabase/component'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error] = useState('')
  const router = useRouter()
  const supabase = createClient()

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) {
    toast.error(error.message)
  } else {
    toast.success('Signup successful! Check your email.')
    router.push('/')
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Create an Account</h2>
        <form onSubmit={handleSignup} className="space-y-4 text-black">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg"
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
          <button className="w-full bg-blue-600 text-white py-3 cursor-pointer rounded-lg hover:bg-blue-700 transition">
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-black">
          Already have an account?{' '}
          <Link href="/" className="text-blue-600 hover:underline cursor-pointer">Log In</Link>
        </p>
      </div>
    </div>
  )
}
