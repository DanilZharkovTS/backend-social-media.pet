import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares'
import { chatMiddlewares } from '../../middlewares/user/chatMiddlewares'
import { chatController } from '../../controllers/user/chatController'

const router = Router()

router.post(
  '/',
  authMiddlewares.verifyAccessToken,
  chatMiddlewares.createOrFindPrivateChat,
  chatController.createOrFindPrivateChat
)

export default router
