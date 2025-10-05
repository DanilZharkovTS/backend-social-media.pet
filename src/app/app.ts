import express from 'express'
import type { Request, Response } from 'express'
import pool from './pool.ts'
const app = express()
const PORT = 3000

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`))
