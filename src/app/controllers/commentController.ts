import type { NextFunction, Request, Response } from 'express'
import { commentServices } from '../services/commentServices.ts'

export const commentController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await commentServices.add(req.body, req.paramsMap.postId)
      return res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  },
  readAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await commentServices.getAll(
        req.paramsMap.postId,
        req.pagination
      )
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await commentServices.delete(
        req.paramsMap.commentId,
        req.body
      )
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}
