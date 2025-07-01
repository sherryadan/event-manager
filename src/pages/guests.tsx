import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '../../lib/supabase/component'

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchAllGuests()
  }, [])

  const fetchAllGuests = async () => {
    try {
      const res = await fetch('/api/guests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (res.ok) {
        const data = await res.json()
        setGuests(data)
      } else {
        toast.error('Failed to fetch guests')
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
      toast.error('Failed to fetch guests')
    } finally {
      setLoading(false)
    }
  }

  const deleteGuest = async (guestId: string) => {
    const confirmed = confirm('Are you sure you want to delete this guest?')
    if (!confirmed) return

    try {
      const res = await fetch(`/api/guests/${guestId}`, { 
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (res.ok) {
        toast.success('Guest deleted successfully')
        fetchAllGuests() // Refresh the list
      } else {
        toast.error('Failed to delete guest')
      }
    } catch (error) {
      console.error('Error deleting guest:', error)
      toast.error('Failed to delete guest')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>

  return (
    <div className="max-w-4xl mx-auto mt-10 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">All Guests</h1>
        <div className="flex gap-2">
          <Link href="/events" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Back to Events
          </Link>
          <button 
            onClick={handleLogout} 
            className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {guests.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-600">No guests found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {guests.map((guest: any) => (
            <div key={guest.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{guest.name}</h3>
                  <p className="text-gray-600">{guest.email}</p>
                  {guest.event && (
                    <p className="text-sm text-blue-600 mt-1">
                      Event: {guest.event.title} ({new Date(guest.event.date).toLocaleDateString()})
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteGuest(guest.id)}
                    className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
