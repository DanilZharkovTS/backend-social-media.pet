import { Router } from "express";
import { authMiddlewares } from "../../middlewares/auth/authMiddlewares.ts";
import { paymentsController } from "../../controllers/paymentsController.ts";
import { paymentsMiddlewares } from "../../middlewares/paymentsMiddlewares.ts";

const router = Router()

router.get('/checkout', authMiddlewares.verifyAccessToken, paymentsController.startCheckout)

router.post('/webhook', paymentsMiddlewares.handleWebhook)

export default router