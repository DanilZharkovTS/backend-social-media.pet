import { Router } from "express";
import { authMiddlewares } from "../../middlewares/auth/authMiddlewares.ts";

const router = Router()

router.post('/checkout', authMiddlewares.verifyAccessToken)

export default router