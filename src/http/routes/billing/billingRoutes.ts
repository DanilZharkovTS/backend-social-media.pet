import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares.ts'
import { billingMiddlewares } from '../../middlewares/billingMiddlewares.ts'
import { billingController } from '../../controllers/billingController.ts'
import { rateLimiter } from '../../middlewares/helpers/rateLimiter.ts'

const router = Router()

router.post(
  '/checkout',
  rateLimiter(5, 60, 'checkout'),
  authMiddlewares.verifyAccessToken,
  authMiddlewares.requireSessionType('normal'),
  billingMiddlewares.validateCheckout,
  billingController.startCheckout
)

export default router
