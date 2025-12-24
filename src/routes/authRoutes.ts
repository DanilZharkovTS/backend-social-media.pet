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

router.post(
  '/request-change-email',
  authMiddlewares.verifyAccessToken,
  emailMiddlewares.requestChangeEmail,
  emailController.requestChangeEmail
)

router.get(
  '/change-email',
  emailMiddlewares.changeEmail,
  emailController.changeEmail
)

router.post(
  '/forgot-password',
  emailMiddlewares.forgotPassword,
  emailController.forgotPassword
)

router.get(
  '/change-password-email',
  authMiddlewares.verifyAccessToken,
  emailController.requestPasswordResetEmail
)

router.post(
  '/reset-password',
  emailMiddlewares.resetPassword,
  emailController.resetPassword
)

router.get('/logout', authMiddlewares.refresh, authController.logout)

export default router
