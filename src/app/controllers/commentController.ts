import type { NextFunction, Request, Response } from 'express'
import { commentServices } from '../services/commentServices.ts'

export const commentController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await commentServices.add(req.body, req.paramsId.id)
      return res.status(201).json({ created: result })
    } catch (err) {
      next(err)
    }
  },
}
