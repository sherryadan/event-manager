import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function GuestsPage() {
    const router = useRouter()
    const { slug } = router.query

    const [event, setEvent] = useState<any>(null)
    const [guestName, setGuestName] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [guests, setGuests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (slug) {
            fetchEvent()
            fetchGuests()
        }
    }, [slug])

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/events/${slug}`)
            if (res.ok) {
                const data = await res.json()
                setEvent(data)
            } else {
                toast.error('Failed to load event')
                router.push('/events')
            }
        } catch (error) {
            toast.error('Error loading event')
            router.push('/events')
        } finally {
            setLoading(false)
        }
    }

    const fetchGuests = async () => {
        try {
            const res = await fetch(`/api/events/${slug}/guests`)
            if (res.ok) {
                const data = await res.json()
                setGuests(data)
            } else {
                toast.error('Failed to load guests')
            }
        } catch (error) {
            toast.error('Error loading guests')
        }
    }

    const addGuest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!event) return

        try {
            const res = await fetch('/api/guests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: guestName, 
                    email: guestEmail, 
                    eventId: event.id 
                }),
            })
            
            if (res.ok) {
                toast.success('Guest added successfully')
                setGuestName('')
                setGuestEmail('')
                fetchGuests()
            } else {
                const error = await res.json()
                toast.error(error.error || 'Failed to add guest')
            }
        } catch (error) {
            toast.error('Error adding guest')
        }
    }

    const deleteGuest = async (guestId: string) => {
        const confirmed = confirm('Are you sure you want to delete this guest?')
        if (!confirmed) return

        try {
            const res = await fetch(`/api/guests/${guestId}`, { 
                method: 'DELETE' 
            })
            
            if (res.ok) {
                toast.success('Guest deleted successfully')
                fetchGuests()
            } else {
                toast.error('Failed to delete guest')
            }
        } catch (error) {
            toast.error('Error deleting guest')
        }
    }

    const exportGuests = () => {
        const csvContent = [
            ['Name', 'Email'],
            ...guests.map(guest => [guest.name, guest.email])
        ].map(row => row.join(',')).join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${event?.title || 'event'}-guests.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Guest list exported')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">Event not found</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {event.title}
                            </h1>
                            <p className="text-gray-600">
                                {new Date(event.date).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push(`/events/${slug}`)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                            >
                                Back to Event
                            </button>
                            <button
                                onClick={exportGuests}
                                disabled={guests.length === 0}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Guest Management</h2>
                        
                        <form onSubmit={addGuest} className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Guest</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Guest Name" 
                                    value={guestName}
                                    required 
                                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    onChange={e => setGuestName(e.target.value)} 
                                />
                                <input 
                                    type="email" 
                                    placeholder="Guest Email" 
                                    value={guestEmail}
                                    required 
                                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    onChange={e => setGuestEmail(e.target.value)} 
                                />
                                <button 
                                    type="submit" 
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Add Guest
                                </button>
                            </div>
                        </form>

                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Guest List ({guests.length} {guests.length === 1 ? 'guest' : 'guests'})
                                </h3>
                            </div>
                            
                            {guests.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p className="text-lg">No guests added yet</p>
                                    <p className="text-sm mt-2">Add your first guest using the form above</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {guests.map((guest, index) => (
                                        <div key={guest.id} className="px-6 py-4 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{guest.name}</h4>
                                                            <p className="text-sm text-gray-600">{guest.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => deleteGuest(guest.id)} 
                                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-md transition text-sm font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 