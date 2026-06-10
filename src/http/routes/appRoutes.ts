import { Router } from 'express'
import authRoutes from './auth/authRoutes.ts'
import adminRoutes from './admin/adminRoutes.ts'
import userRoutes from './user/userRoutes.ts'
import chatRoutes from './user/chatRoutes.ts'
import billingRoutes from './billing/billingRoutes.ts'
import postRoutes from './user/postRoutes.ts'
import notificationRoutes from './user/notificationRoutes.ts'
import { authMiddlewares } from '../middlewares/auth/authMiddlewares.ts'
import { requiresRole } from '../middlewares/helpers/role.ts'

const router = Router()

router.use('/auth', authRoutes)

router.use(
  '/admin',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  authMiddlewares.requireSessionType('normal'),
  adminRoutes
)

router.use('/users', userRoutes)

router.use('/chats', chatRoutes)

router.use('/notifications', notificationRoutes)

router.use('/billing', billingRoutes)

router.use('/posts', postRoutes)

export default router
