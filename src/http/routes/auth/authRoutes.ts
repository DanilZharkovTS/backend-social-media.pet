import { authController } from '../../controllers/authController.ts'
import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares.ts'
import { rateLimiter } from '../../middlewares/helpers/rateLimiter.ts'

const router = Router()

router.post(
  '/register',
  rateLimiter(5, 60, 'register'),
  authMiddlewares.register,
  authController.register
)

router.get(
  '/verify-email',
  rateLimiter(5, 60, 'verifyEmail'),
  authMiddlewares.verifyEmail,
  authController.verifyEmail
)

router.post(
  '/login',
  rateLimiter(10, 60, 'login'),
  authMiddlewares.login,
  authController.login
)

router.post(
  '/login/email-confirm',
  rateLimiter(5, 60, 'emailConfirm'),
  authMiddlewares.loginEmailConfirm,
  authController.loginEmailConfirm
)

router.get(
  '/refresh',
  rateLimiter(10, 60, 'refresh'),
  authMiddlewares.refresh,
  authController.refresh
)

router.post(
  '/request-change-email',
  rateLimiter(5, 60, 'requestChangeEmail'),
  authMiddlewares.verifyAccessToken,
  authMiddlewares.requestChangeEmail,
  authController.requestChangeEmail
)

router.get(
  '/change-email',
  rateLimiter(5, 60, 'changeEmail'),
  authMiddlewares.changeEmail,
  authController.changeEmail
)

router.post(
  '/forgot-password',
  rateLimiter(5, 60, 'forgotPassword'),
  authMiddlewares.forgotPassword,
  authController.forgotPassword
)

router.get(
  '/change-password-email',
  rateLimiter(5, 60, 'changePasswordEmail'),
  authMiddlewares.verifyAccessToken,
  authController.requestPasswordResetEmail
)

router.post(
  '/reset-password',
  rateLimiter(5, 60, 'resetPassword'),
  authMiddlewares.resetPassword,
  authController.resetPassword
)

router.get(
  '/logout',
  rateLimiter(1, 60, 'logout'),
  authMiddlewares.refresh,
  authController.logout
)

export default router
