import { Router } from 'express'
import { authMiddlewares } from '../middlewares/authMiddlewares.ts'
import { userController } from '../controllers/userController.ts'
import { setParamsId } from '../middlewares/helpers/paramsId.ts'

const router = Router()

router.get('/me', authMiddlewares.verifyAccessToken, userController.readMyInfo)

router.get(
  '/:userId',
  authMiddlewares.verifyAccessToken,
  setParamsId(['userId']),
  userController.readUserInfo
)

export default router
