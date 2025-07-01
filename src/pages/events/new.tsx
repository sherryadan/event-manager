import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { createClient } from '../../../lib/supabase/component'
import type { User } from '@supabase/supabase-js'

export default function NewEvent() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/')
      } else {
        setUser(data.session.user)
      }
    }
    getSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date }),
      })

      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please try again.')
      }

      const result = await res.json()

      if (res.ok) {
        toast.success('Event created!')
        router.push('/events')
      } else {
        console.error('API Error:', result)
        toast.error(result.error || result.details || 'Failed to create event.')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      if (err instanceof Error) {
        toast.error(err.message || 'Something went wrong.')
      } else {
        toast.error('Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-black">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <input
          type="text"
          placeholder="Event Title"
          className="w-full p-2 border rounded text-black"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="date"
          className="w-full p-2 border rounded text-black"
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-400 p-2 rounded text-black cursor-pointer hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
      <div className="max-w-xl mx-auto mt-4 flex justify-end">
        <button
          type="button"
          className="bg-gray-300 px-4 py-2 rounded text-black hover:bg-gray-400 transition"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  )
}
