import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares'
import { notificationMiddleware } from '../../middlewares/user/notificationMiddlewares'
import { notificationController } from '../../controllers/user/notificationController'

const router = Router()

router.get(
  '/',
  authMiddlewares.verifyAccessToken,
  notificationMiddleware.getNotififcations,
  notificationController.getNotifications
)

export default router
