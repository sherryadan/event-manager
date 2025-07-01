import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { supabase } from '../../../../lib/supabaseClient'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const guest = await prisma.guest.findUnique({ where: { id: id as string }, include: { event: true } })
  if (!guest || guest.event.userId !== user.id) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method === 'DELETE') {
    await prisma.guest.delete({ where: { id: id as string } })
    return res.status(204).end()
  }

  res.setHeader('Allow', ['DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
