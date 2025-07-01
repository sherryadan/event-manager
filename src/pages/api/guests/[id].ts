import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import createClient from '../../../../lib/supabase/api'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createClient(req, res)
    const { id } = req.query
    
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
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!
        }
      })
      console.log('Created new user in database:', dbUser)
    }

    const guest = await prisma.guest.findUnique({ where: { id: id as string }, include: { event: true } })
    if (!guest || guest.event.userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (req.method === 'DELETE') {
      await prisma.guest.delete({ where: { id: id as string } })
      return res.status(204).end()
    }

    res.setHeader('Allow', ['DELETE'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
