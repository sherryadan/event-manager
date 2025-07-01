import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { supabase } from '../../../../lib/supabaseClient'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { name, email, eventId } = req.body

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event || event.userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const guest = await prisma.guest.create({
      data: { name, email, eventId }
    })
    return res.status(200).json(guest)
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
