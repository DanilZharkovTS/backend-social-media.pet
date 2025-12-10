import { Router } from 'express'
import { authMiddlewares } from '../middlewares/authMiddlewares.ts'
import { userController } from '../controllers/userController.ts'
import { setParamsId } from '../middlewares/helpers/paramsId.ts'
import { userMiddlewares } from '../middlewares/userMiddlewares.ts'
import { upload } from '../lib/uploadMiddleware.ts'
import { requiresRole } from '../middlewares/helpers/role.ts'

const router = Router()

//me

router.get('/me', authMiddlewares.verifyAccessToken, userController.readMyInfo)

router.patch(
  '/me',
  authMiddlewares.verifyAccessToken,
  userMiddlewares.validateBirthDate,
  userMiddlewares.updateMyInfo,
  userController.updateMyInfo
)

router.patch(
  '/me/email',
  authMiddlewares.verifyAccessToken,
  userMiddlewares.updateMyEmail,
  userController.updateMyEmail
)

router.patch(
  '/me/password',
  authMiddlewares.verifyAccessToken,
  userMiddlewares.updateMyPassword,
  userController.updateMyPassword
)

router.patch(
  '/me/avatar',
  authMiddlewares.verifyAccessToken,
  userMiddlewares.updateMyAvatarUrl,
  userController.updateMyAvatarUrl
)

router.post(
  '/me/avatar/upload',
  authMiddlewares.verifyAccessToken,
  upload.single('avatar'),
  userController.uploadMyAvatar
)

//users

router.get(
  '/:userId',
  authMiddlewares.verifyAccessToken,
  setParamsId(['userId']),
  userController.readUserInfo
)

export default router

//admin

router.delete(
  '/:userId/delete/admin',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  setParamsId(['userId']),
  userMiddlewares.deleteUserAsAdmin,
  userController.deleteUserAsAdmin
)
