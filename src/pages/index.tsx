import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error) {
      router.push('/dashboard')
    } else {
      alert(error.message)
    }
  }

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input className="w-full p-2 border" type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input className="w-full p-2 border mt-2" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button type="submit" className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Login</button>
    </form>
  )
}
