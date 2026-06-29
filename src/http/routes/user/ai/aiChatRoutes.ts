import { Router } from 'express'
import { aiChatController } from '../../../controllers/user/ai/aiChatController'
import { authMiddlewares } from '../../../middlewares/auth/authMiddlewares'

const router = Router()

router.post(
  '/replies',
  authMiddlewares.verifyAccessToken,
  aiChatController.getAiQuickReplies
)

export default router
