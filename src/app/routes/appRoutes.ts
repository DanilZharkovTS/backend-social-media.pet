import { Router } from 'express'
import postRoutes from './postRoutes.ts'
import authRoutes from './authRoutes.ts'

const router = Router()

router.use('/posts', postRoutes)

router.use('/auth', authRoutes)

export default router