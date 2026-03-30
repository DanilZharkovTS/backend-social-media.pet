import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares'
import { chatMiddlewares } from '../../middlewares/user/chatMiddlewares'
import { chatController } from '../../controllers/user/chatController'
import { rateLimiter } from '../../middlewares/helpers/rateLimiter'
import { paginate } from '../../middlewares/helpers/pagination'
import { setParamsId } from '../../middlewares/helpers/paramsId'

const router = Router()

router.get(
  '/',
  rateLimiter(60, 60, 'getChats'),
  authMiddlewares.verifyAccessToken,
  paginate,
  chatController.getUserChats
)

router.post(
  '/private',
  rateLimiter(5, 60, 'addPrivateChat'),
  authMiddlewares.verifyAccessToken,
  chatMiddlewares.createOrFindPrivateChat,
  chatController.createOrFindPrivateChat
)

router.delete(
  '/:chatId',
  rateLimiter(5, 60, 'deleteChat'),
  authMiddlewares.verifyAccessToken,
  setParamsId(['chatId']),
  chatController.deleteChat
)

//peeps

router.get(
  '/:chatId/peeps',
  authMiddlewares.verifyAccessToken,
  setParamsId(['chatId']),
  chatMiddlewares.findPeeps,
  chatController.findPeeps
)

export default router
