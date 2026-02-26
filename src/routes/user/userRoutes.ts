import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares.ts'
import { userController } from '../../controllers/user/userController.ts'
import { setParamsId } from '../../middlewares/helpers/paramsId.ts'
import { userMiddlewares } from '../../middlewares/user/userMiddlewares.ts'
import { upload } from '../../lib/uploadMiddleware.ts'
import { rateLimiter } from '../../middlewares/helpers/rateLimiter.ts'

const router = Router()

//me

router.get('/me', authMiddlewares.verifyAccessToken, userController.readMyInfo)

router.patch(
  '/me',
  rateLimiter(60, 60, 'myInfo'),
  authMiddlewares.verifyAccessToken,
  userMiddlewares.validateBirthDate,
  userMiddlewares.updateMyInfo,
  userController.updateMyInfo
)

router.patch(
  '/me/email',
  rateLimiter(5, 60, 'myEmail'),
  authMiddlewares.verifyAccessToken,
  userMiddlewares.updateMyEmail,
  userController.updateMyEmail
)

router.patch(
  '/me/password',
  rateLimiter(5, 60, 'myPassword'),
  authMiddlewares.verifyAccessToken,
  userMiddlewares.updateMyPassword,
  userController.updateMyPassword
)

router.patch(
  '/me/avatar',
  rateLimiter(10, 60, 'myAvatar'),
  authMiddlewares.verifyAccessToken,
  userMiddlewares.updateMyAvatarUrl,
  userController.updateMyAvatarUrl
)

router.post(
  '/me/avatar/upload',
  rateLimiter(10, 60, 'uploadMyAvatar'),
  authMiddlewares.verifyAccessToken,
  upload.single('avatar'),
  userController.uploadMyAvatar
)

//users

router.get(
  '/:userId',
  rateLimiter(60, 60, 'getUser'),
  authMiddlewares.verifyAccessToken,
  setParamsId(['userId']),
  userController.readUserInfo
)

export default router
