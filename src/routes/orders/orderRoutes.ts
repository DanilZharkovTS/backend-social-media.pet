import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares.ts'
import { orderController } from '../../controllers/orderController.ts'
import { orderMiddlewares } from '../../middlewares/orderMiddlewares.ts'

const router = Router()

router.get(
  '/checkout',
  authMiddlewares.verifyAccessToken,
  orderMiddlewares.validateCheckout,
  orderController.startCheckout
)

export default router
