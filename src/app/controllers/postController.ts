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
  readAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.getAll(req.pagination)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.update(req.paramsId.id, req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.delete(req.paramsId.id, req.body.name)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  find: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.find(req.querySearch)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}
