import { Router } from 'express'
import adminRoutes from './admin/adminRoutes.ts'
import userRoutes from './user/userRoutes.ts'
import postRoutes from './user/postRoutes.ts'
import authRoutes from './auth/authRoutes.ts'
import { authMiddlewares } from '../middlewares/auth/authMiddlewares.ts'
import { requiresRole } from '../middlewares/helpers/role.ts'

const router = Router()

router.use(
  '/admin',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  adminRoutes
)

router.use('/users', userRoutes)

router.use('/posts', postRoutes)

router.use('/auth', authRoutes)

export default router
