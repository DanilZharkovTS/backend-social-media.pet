import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares.ts'
import { orderController } from '../../controllers/orderController.ts'
import { paymentsMiddlewares } from '../../middlewares/paymentsMiddlewares.ts'

const router = Router()

router.get(
  '/checkout',
  authMiddlewares.verifyAccessToken,
  orderController.startCheckout
)

router.post('/webhook', paymentsMiddlewares.handleWebhook)

export default router
