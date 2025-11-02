import type { NextFunction, Request, Response } from "express";
import { validateAddComment } from "../utils/validators/commentsValidator.ts";

export const commentMiddlewares = {
  add: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateAddComment.parse(req.body)
      return next()
    } catch (err) {
      return next(err)
    }
  }
}