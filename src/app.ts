import express, { Router } from 'express'
import cors from 'cors'
import type { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import appRoutes from './routes/appRoutes.ts'
import { errHandler } from './middlewares/app/errHandler.ts'
import { jsonMiddleware } from './middlewares/app/jsonMiddleware.ts'
import { paymentsMiddlewares } from './middlewares/paymentsMiddlewares.ts'
import { paymentsController } from './controllers/paymentsController.ts'

dotenv.config({ path: '../.env' })

const app = express()
const PORT = process.env.PORT || 3000

app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentsMiddlewares.handleWebhook,
  paymentsController.handleWebhook
)

app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
)
app.use(cookieParser())

app.use(
  express.json({
    verify: (req: Request, res: Response, buf: Buffer) => {
      try {
        JSON.parse(buf.toString())
      } catch (err) {
        throw new SyntaxError('Invalid JSON')
      }
    },
  })
)

app.use(jsonMiddleware)

app.use('/api', appRoutes)

app.use(errHandler)

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`))
