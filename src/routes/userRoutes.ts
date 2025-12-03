import { Router } from 'express'
import { authMiddlewares } from '../middlewares/authMiddlewares.ts'
import { userController } from '../controllers/userController.ts'
import { setParamsId } from '../middlewares/helpers/paramsId.ts'
import { userMiddlewares } from '../middlewares/userMiddlewares.ts'

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

//users

router.get(
  '/:userId',
  authMiddlewares.verifyAccessToken,
  setParamsId(['userId']),
  userController.readUserInfo
)

export default router
