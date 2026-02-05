import { Router } from 'express'
import authRoutes from './auth/authRoutes.ts'
import adminRoutes from './admin/adminRoutes.ts'
import userRoutes from './user/userRoutes.ts'
import paymentsRoutes from './orders/paymentsRoutes.ts'
import postRoutes from './user/postRoutes.ts'
import { authMiddlewares } from '../middlewares/auth/authMiddlewares.ts'
import { requiresRole } from '../middlewares/helpers/role.ts'

const router = Router()

router.use('/auth', authRoutes)

router.use(
  '/admin',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  adminRoutes
)

router.use('/users', userRoutes)

router.use('/payments', paymentsRoutes)

router.use('/posts', postRoutes)


export default router
