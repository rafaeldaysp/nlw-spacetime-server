import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export default async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => {
    await req.jwtVerify()
  })
  app.get('/memories', async (req) => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      where: {
        userId: req.user.sub,
      },
    })
    return memories.map((memory) => ({
      id: memory.id,
      coverUrl: memory.coverUrl,
      userId: memory.userId,
      content: memory.content,
      isPublic: memory.isPublic,
      createdAt: memory.createdAt,
    }))
  })

  app.get('/memories/:id', async (req, res) => {
    const { id } = z
      .object({
        id: z.string().uuid(),
      })
      .parse(req.params)
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })
    if (memory.userId !== req.user.sub && !memory.isPublic) {
      return res.status(401).send('Unauthorized')
    }

    return memory
  })
  app.post('/memories', async (req, res) => {
    const { content, coverUrl, isPublic } = z
      .object({
        coverUrl: z.string(),
        content: z.string(),
        isPublic: z.coerce.boolean().default(false),
      })
      .parse(req.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: req.user.sub,
      },
    })
    return memory
  })
  app.put('/memories/:id', async (req, res) => {
    const { id } = z
      .object({
        id: z.string().uuid(),
      })
      .parse(req.params)
    const { content, coverUrl, isPublic } = z
      .object({
        content: z.string(),
        coverUrl: z.string(),
        isPublic: z.coerce.boolean().default(false),
      })
      .parse(req.body)
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== req.user.sub && !memory.isPublic) {
      return res.status(401).send('Unauthorized')
    }
    const updatedMemory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })
    return updatedMemory
  })

  app.delete('/memories/:id', async (req, res) => {
    const { id } = z
      .object({
        id: z.string().uuid(),
      })
      .parse(req.params)
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== req.user.sub && !memory.isPublic) {
      return res.status(401).send('Unauthorized')
    }
    const deletedMemory = await prisma.memory.delete({
      where: {
        id,
      },
    })
    return deletedMemory
  })

  // app.post('/users', (req, res) => {
  //   return 'hello'
  // })
}
