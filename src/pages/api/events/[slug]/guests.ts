import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import createClient from '../../../../../lib/supabase/api'

// Use a singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { slug } = req.query
    const supabase = createClient(req, res)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      return res.status(401).json({ error: 'Authentication failed', details: authError.message })
    }
    
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
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
