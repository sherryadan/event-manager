// pages/api/rsvp/[slug].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, RsvpStatus } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query as { slug: string }

  if (req.method === 'POST') {
    const { name, email, rsvp } = req.body

    // Find the event
    const event = await prisma.event.findUnique({ where: { slug } })
    if (!event) return res.status(404).json({ error: 'Event not found' })

    // Find guest
    const guest = await prisma.guest.findFirst({
      where: {
        email,
        eventId: event.id
      }
    })

    if (!guest) {
      return res.status(404).json({ error: 'Guest not found for this event' })
    }

    const updated = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        name,
        rsvp: rsvp as RsvpStatus
      }
    })

    return res.status(200).json(updated)
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
