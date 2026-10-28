import express from 'express'
import cors from 'cors'
import { adminApiRouter } from '@/interfaces/admin-api/routes/api'
import { errorHandler } from '@/interfaces/admin-api/middlewares/error-middleware'

export const createApp = () => {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use('/api', adminApiRouter)
  app.use(errorHandler)

  return app
}
