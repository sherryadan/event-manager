
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
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
    }

    if (req.method === 'POST') {
      const { title, date } = req.body
      
      if (!title || !date) {
        return res.status(400).json({ error: 'Title and date are required' })
      }
      
      const event = await prisma.event.create({
        data: {
          title,
          date: new Date(date),
          slug: randomUUID(),
          userId: user.id
        }
      })
      
      return res.status(201).json(event)
    }

    if (req.method === 'GET') {
      const events = await prisma.event.findMany({
        where: { userId: user.id },
        orderBy: { date: 'asc' }
      })
      
      return res.status(200).json(events)
    }

    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
