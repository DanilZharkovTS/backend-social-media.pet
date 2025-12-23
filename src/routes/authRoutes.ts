import { authController } from '../controllers/authController.ts'
import { Router } from 'express'
import { authMiddlewares } from '../middlewares/authMiddlewares.ts'
import { emailController } from '../controllers/emailController.ts'
import { emailMiddlewares } from '../middlewares/emailMiddlewares.ts'

const router = Router()

router.post('/register', authMiddlewares.register, authController.register)

router.get(
  '/verify-email',
  emailMiddlewares.verifyEmail,
  emailController.verifyEmail
)

router.post('/login', authMiddlewares.login, authController.login)

router.get('/refresh', authMiddlewares.refresh, authController.refresh)

router.get('/logout', authMiddlewares.refresh, authController.logout)

export default router
