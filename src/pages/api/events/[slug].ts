import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { supabase } from '../../../../lib/supabaseClient'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = req.query.slug as string
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const event = await prisma.event.findUnique({ where: { slug } })
  if (!event || event.userId !== user.id) {
    return res.status(404).json({ error: 'Not found or unauthorized' })
  }

  if (req.method === 'GET') {
    return res.status(200).json(event)
  }

  if (req.method === 'PUT') {
    const { title, date } = req.body
    const updated = await prisma.event.update({
      where: { slug },
      data: { title, date: new Date(date) },
    })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await prisma.event.delete({ where: { slug } })
    return res.status(204).end()
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
