import type { Request, Response } from 'express'
import express from 'express'
import cors from 'cors'
import http from 'http'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { errHandler } from './http/middlewares/app/errHandler.ts'
import appRoutes from './http/routes/appRoutes.ts'
import './crons/index.ts'
import { billingMiddlewares } from './http/middlewares/billingMiddlewares.ts'
import { billingController } from './http/controllers/billingController.ts'
import { Server } from 'socket.io'
import { registerSockets } from './websocket/index.ts'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.post(
  '/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  billingMiddlewares.handleWebhook,
  billingController.handleWebhook
)

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
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

app.use('/api', appRoutes)

app.use(errHandler)

const server = http.createServer(app)
export const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL },
})

registerSockets(io)

server.listen(PORT, () => console.log(`Example app listening on port ${PORT}`))
