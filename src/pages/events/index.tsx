import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createClient } from '../../../lib/supabase/component'

export default function EventsList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetch('/api/events' , {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(res => res.json())
      .then(setEvents)
      
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="max-w-3xl mx-auto mt-10 text-black">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Your Events</h1>
        <Link href="/events/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">+ New Event</Link>
      </div>
      <ul className="space-y-4">
        {Array.isArray(events) && events.map((event: any) => (
          <li key={event.id} className="border p-4 rounded bg-white shadow">
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
            <div className="flex gap-2 mt-2">
              <Link href={`/events/${event.slug}`} className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 transition">
                View
              </Link>
              <Link href={`/events/${event.slug}`} className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600 transition">
                Edit
              </Link>
              <Link
                href={`/rsvp/${event.slug}`}
                className="bg-yellow-500 text-white text-sm px-3 py-1 rounded hover:bg-yellow-600 transition"
              >
                RSVP
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout} className="mt-4 bg-red-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700 transition">Logout</button>

    </div>
  )
}
