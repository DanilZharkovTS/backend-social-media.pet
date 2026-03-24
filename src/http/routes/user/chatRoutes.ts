import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares'
import { chatMiddlewares } from '../../middlewares/user/chatMiddlewares'
import { chatController } from '../../controllers/user/chatController'
import { rateLimiter } from '../../middlewares/helpers/rateLimiter'

const router = Router()

router.get(
  '/',
  rateLimiter(60, 60, 'getChats'),
  authMiddlewares.verifyAccessToken,
  chatController.getUserChats
)

router.post(
  '/private',
  rateLimiter(5, 60, 'addPrivateChat'),
  authMiddlewares.verifyAccessToken,
  chatMiddlewares.createOrFindPrivateChat,
  chatController.createOrFindPrivateChat
)

export default router
