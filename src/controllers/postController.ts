import type { NextFunction, Request, Response } from 'express'
import { postService } from '../services/postService.ts'

export const postController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.add(req.body, req.user)
      return res.status(201).json(result)
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
      const result = await postService.update(
        req.paramsMap.postId,
        req.body,
        req.user
      )
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.delete(req.paramsMap.postId, req.user)
      res.status(200).json(result)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  find: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.find(req.queryMap, req.pagination)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  //admin
  deleteAsAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.deleteAsAdmin(req.paramsMap.postId)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}
