import { Router } from "express";
import { authMiddlewares } from "../middlewares/authMiddlewares.ts";
import { userController } from "../controllers/userController.ts";

const router = Router()

router.get('/me', authMiddlewares.verifyAccessToken, userController.readMyInfo)

export default router