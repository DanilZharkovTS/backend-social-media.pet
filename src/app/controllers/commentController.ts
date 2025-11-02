import type { NextFunction, Request, Response } from 'express'
import { commentServices } from '../services/commentServices.ts'

export const commentController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await commentServices.add(req.body, req.paramsId.id)
      return res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  },
  readAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await commentServices.getAll(
        req.paramsId.id,
        req.pagination
      )
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}
