import { useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

export default function NewEvent() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date }),
    })
    if (res.ok) {
      toast.success('Event created!')
      router.push('/events')
    } else {
      toast.error('Failed to create event.')
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Event Title"
          className="w-full p-2 border rounded"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Create Event
        </button>
      </form>
    </div>
  )
}
