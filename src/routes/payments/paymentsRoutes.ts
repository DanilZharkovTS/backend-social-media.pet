import { Router } from "express";
import { authMiddlewares } from "../../middlewares/auth/authMiddlewares.ts";
import { paymentsController } from "../../controllers/paymentsController.ts";

const router = Router()

router.post('/checkout', authMiddlewares.verifyAccessToken, paymentsController.startCheckout)

export default router