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
        <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow text-black">
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
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition">Update</button>
                    <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700 transition">Delete</button>
                    <button
                        type="button"
                        onClick={() => {
                            const eventUrl = `${window.location.origin}/events/${slug}`
                            navigator.clipboard.writeText(eventUrl)
                            toast.success('Event URL copied to clipboard!')
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700 transition"
                    >
                        Share
                    </button>
                    <button type="button" onClick={() => router.push('/events')} className="bg-gray-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-700 transition">Back</button>
                </div>
            </form>

        </div>
    )
}
