import type { NextFunction, Request, Response } from 'express'
import express from 'express'

export const jsonMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const method = req.method.toUpperCase()
  const contentType = req.headers['content-type'] || ''
  const methodsWithBody = [ 'PUT', 'PATCH']

  if (methodsWithBody.includes(method)) {
    if (!contentType.includes('application/json')) {
      return res.status(400).json({
        error: `Content-Type must be application/json for ${method} requests`,
      })
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: `Request body cannot be empty for ${method} requests`,
      })
    }
  }

  next()
}
