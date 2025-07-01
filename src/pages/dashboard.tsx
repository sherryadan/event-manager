import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

type Event = {
  id: string
  title: string
  date: string
  slug: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/')
      } else {
        setUser(data.session.user)
        fetchEvents()
      }
    }
    checkSession()
  }, [])

  const fetchEvents = async () => {
    const res = await fetch('/api/events')
    if (res.ok) {
      const data = await res.json()
      setEvents(data)
      setLoading(false)
    } else {
      toast.error('Failed to load events')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out!')
    router.push('/')
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.email}</h1>
            <p className="text-gray-600">Manage your events below.</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Log Out
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Events</h2>
          <Link
            href="/events/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Create Event
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500">No events found. Create one to get started.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <li key={event.id} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <Link
                  href={`/events/${event.slug}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  View / Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
