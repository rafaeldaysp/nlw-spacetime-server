import 'dotenv/config'
import multipart from '@fastify/multipart'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import memoriesRoutes from './routes/memories'
import { authRoutes } from './routes/auth'
import uploadRoutes from './routes/upload'
import { resolve } from 'path'

const app = fastify()

app.register(multipart)
app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})
app.register(jwt, {
  secret: 'NLWSpacetimeApp',
})

app.register(cors, {
  origin: ['http://localhost:3000'],
})
app.register(memoriesRoutes)
app.register(authRoutes)
app.register(uploadRoutes)
app
  .listen({
    port: 3333,
  })
  .then(() => console.log('Server running on http://localhost:3333'))
