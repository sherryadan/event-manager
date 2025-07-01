import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import createClient from '../../../../lib/supabase/api'

// Use a singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createClient(req, res)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      return res.status(401).json({ error: 'Authentication failed', details: authError.message })
    }
    
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    // Ensure user exists in Prisma database
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      // Create user in Prisma database if they don't exist
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!
        }
      })
      console.log('Created new user in database:', dbUser)
    }

    if (req.method === 'POST') {
      const { name, email, eventId } = req.body

      if (!name || !email || !eventId) {
        return res.status(400).json({ error: 'Name, email, and eventId are required' })
      }

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
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
