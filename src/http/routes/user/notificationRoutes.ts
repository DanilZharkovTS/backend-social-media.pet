import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares'
import { notificationController } from '../../controllers/user/notificationController'
import { paginate } from '../../middlewares/helpers/pagination'

const router = Router()

router.get(
  '/',
  authMiddlewares.verifyAccessToken,
  paginate('cursor'),
  notificationController.getNotifications
)

export default router
