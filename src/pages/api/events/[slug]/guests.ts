import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { supabase } from '../../../../../lib/supabaseClient'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const event = await prisma.event.findUnique({ where: { slug: slug as string } })
  if (!event || event.userId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id },
    orderBy: { name: 'asc' }
  })

  return res.status(200).json(guests)
}
