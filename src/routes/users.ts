import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export default async function users(app: FastifyInstance) {
  app.get('/', () => {
    return 'Hello world'
  })

  app.get('/users', async () => {
    const users = await prisma.user.findMany({
      select: {
        name: true,
      },
    })
    return users
  })

  app.get('/users/:userId/memories', () => {
    return 'hello'
  })

  // app.post('/users', (req, res) => {
  //   return 'hello'
  // })
}
