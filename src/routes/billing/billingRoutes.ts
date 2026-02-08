import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares.ts'
import { billingMiddlewares } from '../../middlewares/billingMiddlewares.ts'
import { billingController } from '../../controllers/billingController.ts'

const router = Router()

router.get(
  '/checkout',
  authMiddlewares.verifyAccessToken,
  billingMiddlewares.validateCheckout,
  billingController.startCheckout
)

export default router
