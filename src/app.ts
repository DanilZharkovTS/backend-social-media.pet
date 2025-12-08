import express, { Router } from 'express'
import cors from 'cors'
import type { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import appRoutes from './routes/appRoutes.ts'
import { errHandler } from './middlewares/app/errHandler.ts'
import { jsonMiddleware } from './middlewares/app/jsonMiddleware.ts'

dotenv.config({ path: '../.env' })

const app = express()
const PORT = process.env.PORT || 3000

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

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' })
  }
  next(err)
})

app.use('/api', appRoutes)

app.use(errHandler)

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`))
