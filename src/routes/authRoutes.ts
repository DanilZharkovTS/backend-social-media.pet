import { authController } from '../controllers/authController.ts'
import { Router } from 'express'
import { authMiddlewares } from '../middlewares/authMiddlewares.ts'
import { emailController } from '../controllers/emailController.ts'
import { emailMiddlewares } from '../middlewares/emailMiddlewares.ts'
import { requiresRole } from '../middlewares/helpers/role.ts'
import { setParamsId } from '../middlewares/helpers/paramsId.ts'
import { userMiddlewares } from '../middlewares/userMiddlewares.ts'
import { userController } from '../controllers/userController.ts'

const router = Router()

router.post('/register', authMiddlewares.register, authController.register)

router.get(
  '/verify-email',
  emailMiddlewares.verifyEmail,
  emailController.verifyEmail
)

router.post('/login', authMiddlewares.login, authController.login)

router.post(
  '/login/email-confirm',
  emailMiddlewares.loginEmailConfirm,
  emailController.loginEmailConfirm
)

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

router.post(
  '/admin/delete-user/:userId/request',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  setParamsId(['userId']),
  userMiddlewares.deleteUserAsAdmin,
  userController.deleteUserAsAdmin
)

router.post(
  '/admin/users/delete/confirm',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  emailMiddlewares.adminDeleteUser,
  emailController.adminDeleteUser
)

export default router
