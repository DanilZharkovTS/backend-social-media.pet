import express, { Router } from 'express'
import type { Request, Response } from 'express'
import pool from './pool.ts'
import postRoutes from './routes/postRoutes.ts'
import { errHandler } from './middlewares/errHandler.ts'
const app = express()
const PORT = 3000
const router = Router()

app.use(express.json())

app.use('/api/post', postRoutes)

app.use(errHandler)

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`))
