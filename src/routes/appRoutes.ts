import { Router } from 'express'
import userRoutes from './userRoutes.ts'
import postRoutes from './postRoutes.ts'
import authRoutes from './authRoutes.ts'

const router = Router()

router.use('/users', userRoutes)

router.use('/posts', postRoutes)

router.use('/auth', authRoutes)

export default router
