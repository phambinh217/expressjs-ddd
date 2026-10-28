import { Router } from 'express'
import { userController } from '@/interfaces/admin-api/controllers/user/user-controller'

/**
 * Router admin-api — khai phẳng từng route (đường dẫn đầy đủ → method controller).
 */
export const adminApiRouter = Router()

adminApiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

adminApiRouter.get('/users', userController.index)
adminApiRouter.get('/users/:id', userController.show)
adminApiRouter.post('/users', userController.store)
adminApiRouter.put('/users/:id', userController.update)
adminApiRouter.delete('/users/:id', userController.destroy)
