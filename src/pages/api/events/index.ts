import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { supabase } from '../../../../lib/supabaseClient'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { title, date } = req.body
    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        userId: user.id,
      },
    })
    return res.status(200).json(event)
  }

  if (req.method === 'GET') {
    const events = await prisma.event.findMany({
      where: { userId: user.id },
      orderBy: { date: 'asc' },
    })
    return res.status(200).json(events)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
