import type { NextFunction, Request, Response } from 'express'
import { postService } from '../services/postService.ts'

export const postController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.add(req.body)
      return res.status(201).json(result.rows[0])
    } catch (err) {
      next(err)
    }
  },
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.getAll(req.pagination)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  }
}
