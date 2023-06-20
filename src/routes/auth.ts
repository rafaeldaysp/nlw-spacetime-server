import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import axios from 'axios'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register/github', async (req, res) => {
    const { code } = z
      .object({
        code: z.string(),
      })
      .parse(req.body)

    const accessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    )

    const { access_token } = accessTokenResponse.data

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const { id, name, login, avatar_url } = z
      .object({
        id: z.number(),
        name: z.string(),
        login: z.string(),
        avatar_url: z.string().url(),
      })
      .parse(userResponse.data)

    let user = await prisma.user.findUnique({
      where: {
        githubId: id,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          avatarUrl: avatar_url,
          githubId: id,
          name,
          login,
        },
      })
    }
    const token = app.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: '30 days',
      },
    )
    return {
      token,
    }
  })
}
