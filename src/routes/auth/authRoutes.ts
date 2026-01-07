import { authController } from '../../controllers/auth/authController.ts'
import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares.ts'

const router = Router()

router.post('/register', authMiddlewares.register, authController.register)

router.get(
  '/verify-email',
  authMiddlewares.verifyEmail,
  authController.verifyEmail
)

router.post('/login', authMiddlewares.login, authController.login)

router.post(
  '/login/email-confirm',
  authMiddlewares.loginEmailConfirm,
  authController.loginEmailConfirm
)

router.get('/refresh', authMiddlewares.refresh, authController.refresh)

router.post(
  '/request-change-email',
  authMiddlewares.verifyAccessToken,
  authMiddlewares.requestChangeEmail,
  authController.requestChangeEmail
)

router.get(
  '/change-email',
  authMiddlewares.changeEmail,
  authController.changeEmail
)

router.post(
  '/forgot-password',
  authMiddlewares.forgotPassword,
  authController.forgotPassword
)

router.get(
  '/change-password-email',
  authMiddlewares.verifyAccessToken,
  authController.requestPasswordResetEmail
)

router.post(
  '/reset-password',
  authMiddlewares.resetPassword,
  authController.resetPassword
)

router.get('/logout', authMiddlewares.refresh, authController.logout)

export default router
