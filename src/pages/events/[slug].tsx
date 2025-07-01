import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function EventDetail() {
    const router = useRouter()
    const { slug } = router.query

    const [event, setEvent] = useState<any>(null)
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [guestName, setGuestName] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [guests, setGuests] = useState<any[]>([])



    useEffect(() => {
        if (slug) fetchGuests()
    }, [slug])


    useEffect(() => {
        if (!slug) return
        fetch(`/api/events/${slug}`)
            .then(res => res.json())
            .then(data => {
                setEvent(data)
                setTitle(data.title)
                setDate(data.date.slice(0, 10)) // yyyy-mm-dd
            })
    }, [slug])
    
    const fetchGuests = async () => {
        const res = await fetch(`/api/events/${slug}/guests`)
        const data = await res.json()
        setGuests(data)
    }
    const addGuest = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: guestName, email: guestEmail, eventId: event.id }),
        })
        if (res.ok) {
          toast.success('Guest added')
          setGuestName('')
          setGuestEmail('')
          fetchGuests()
        } else {
          toast.error('Failed to add guest')
        }
      }
      
      const deleteGuest = async (guestId: string) => {
        const res = await fetch(`/api/guests/${guestId}`, { method: 'DELETE' })
        if (res.ok) {
          toast.success('Guest deleted')
          fetchGuests()
        } else {
          toast.error('Delete failed')
        }
      }
      
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch(`/api/events/${slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, date }),
        })
        if (res.ok) {
            toast.success('Event updated')
        } else {
            toast.error('Update failed')
        }
    }

    const handleDelete = async () => {
        const confirmed = confirm('Are you sure?')
        if (!confirmed) return

        const res = await fetch(`/api/events/${slug}`, { method: 'DELETE' })
        if (res.ok) {
            toast.success('Event deleted')
            router.push('/events')
        } else {
            toast.error('Delete failed')
        }
    }

    if (!event) return <p className="text-center mt-10">Loading...</p>

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
            <h1 className="text-xl font-bold mb-4">Edit Event</h1>
            <form onSubmit={handleUpdate} className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <div className="flex justify-between">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
                    <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                </div>
            </form>
            {/* Add Guest */}
            <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-bold mb-4">Guests</h2>
                <form onSubmit={addGuest} className="flex gap-2 mb-4">
                    <input type="text" placeholder="Name" required className="border p-2 flex-1 rounded" onChange={e => setGuestName(e.target.value)} />
                    <input type="email" placeholder="Email" required className="border p-2 flex-1 rounded" onChange={e => setGuestEmail(e.target.value)} />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
                </form>

                <ul className="space-y-2">
                    {guests.map(g => (
                        <li key={g.id} className="flex justify-between items-center bg-gray-50 p-2 rounded shadow-sm">
                            <div>
                                <strong>{g.name}</strong><br />
                                <span className="text-sm text-gray-600">{g.email}</span>
                            </div>
                            <button onClick={() => deleteGuest(g.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    )
}
