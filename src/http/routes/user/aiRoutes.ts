import { Router } from "express";
import aiChatRoutes from "./ai/aiChatRoutes.ts"

const router = Router()

router.use('/chat', aiChatRoutes)

export default router