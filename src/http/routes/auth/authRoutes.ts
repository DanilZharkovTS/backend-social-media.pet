import { authController } from '../../controllers/authController.ts'
import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares.ts'
import { rateLimiter } from '../../middlewares/helpers/rateLimiter.ts'
import { parseDevice } from '../../middlewares/helpers/parseDevice.ts'

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
  parseDevice,
  authMiddlewares.login,
  authController.login
)

router.post(
  '/login/email-confirm',
  rateLimiter(5, 60, 'emailConfirm'),
  parseDevice,
  authMiddlewares.loginEmailConfirm,
  authController.loginEmailConfirm
)

router.post(
  '/refresh',
  rateLimiter(30, 60, 'refresh'),
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
  rateLimiter(5, 60, 'logout'),
  authMiddlewares.refresh,
  authController.logout
)

//shared

router.get(
  '/sessions',
  rateLimiter(60, 60, 'get_sessions'),
  authMiddlewares.verifyAccessToken,
  authController.getMySessions
)

router.post(
  '/invites/link',
  rateLimiter(10, 60, 'auth_invite_link'),
  parseDevice,
  authMiddlewares.verifyAccessToken,
  authMiddlewares.validateInviteTimeInterval,
  authController.getAccountInviteUrl
)

router.post(
  '/invites/accept',
  rateLimiter(5, 60, 'accept_auth_invite'),
  parseDevice,
  authMiddlewares.validateToken,
  authController.acceptAccountInvite
)

router.get(
  '/invites/resolve',
  rateLimiter(30, 60, 'resolve_auth_invite'),
  parseDevice,
  authMiddlewares.validateToken,
  authController.resolveInvite
)

//oauth

router.get(
  '/:provider',
  rateLimiter(20, 60, 'get_provider_url'),
  parseDevice,
  authMiddlewares.checkProviderParam,
  authController.getAuthProviderUrl
)

router.get(
  '/:provider/callback',
  rateLimiter(20, 60, 'oauth_callback'),
  parseDevice,
  authMiddlewares.checkProviderParam,
  authController.authProviderCallback
)

export default router
