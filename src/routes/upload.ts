import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { createWriteStream } from 'fs'
import { extname, resolve } from 'path'
import { pipeline } from 'stream'
import { promisify } from 'util'

const pump = promisify(pipeline)

export default async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (req, res) => {
    const file = await req.file({
      limits: {
        fileSize: 31457280, // 30mb
      },
    })
    if (!file) {
      return res.status(400).send('File not found')
    }

    const mimetypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimetypeRegex.test(file.mimetype)
    if (!isValidFileFormat) {
      return res.status(400).send('Not valid format')
    }

    const fileId = randomUUID()
    const extension = extname(file.filename)
    const filename = fileId.concat(extension)
    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads/', filename),
    )
    await pump(file.file, writeStream)
    //

    const fullUrl = req.protocol.concat('://').concat(req.hostname)
    const fileUrl = new URL(`/uploads/${filename}`, fullUrl).toString()
    return { fileUrl }
  })
}
