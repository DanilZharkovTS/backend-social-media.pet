import type { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService.ts";

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }
}