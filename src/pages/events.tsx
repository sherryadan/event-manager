import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function EventsList() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(setEvents)
  }, [])

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Your Events</h1>
        <Link href="/events/new" className="text-blue-600 underline">+ New Event</Link>
      </div>
      <ul className="space-y-4">
        {Array.isArray(events) && events.map((event: any) => (
          <li key={event.id} className="border p-4 rounded bg-white shadow">
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
            <Link href={`/events/${event.slug}`} className="text-blue-500 text-sm underline mt-2 inline-block">
              View / Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
