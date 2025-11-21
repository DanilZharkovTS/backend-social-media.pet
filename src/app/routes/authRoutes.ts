import { authController } from "../controllers/authController.ts"
import { Router } from "express"
import { authMiddlewares } from "../middlewares/authMiddlewares.ts"

const router = Router()

router.post('/register', authMiddlewares.register, authController.register)

export default router