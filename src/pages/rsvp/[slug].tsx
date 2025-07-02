import { useRouter } from 'next/router'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function RsvpPage() {
  const router = useRouter()
  const { slug } = router.query

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (rsvp: 'YES' | 'NO' | 'MAYBE') => {
    if (!name || !email) {
      toast.error('Please enter your name and email')
      return
    }

    const res = await fetch(`/api/rsvp/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, rsvp })
    })

    if (res.ok) {
      toast.success('RSVP submitted!')
      setSubmitted(true)
    } else {
      const { error } = await res.json()
      toast.error(error || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-black">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">RSVP to the Event</h1>

        {submitted ? (
          <p className="text-center text-green-600 font-semibold">Thank you for your response!</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <p className="mb-2 font-medium">Will you attend?</p>
            <div className="flex justify-between gap-2">
              <button
                onClick={() => handleSubmit('YES')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={() => handleSubmit('NO')}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                No
              </button>
              <button
                onClick={() => handleSubmit('MAYBE')}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Maybe
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


