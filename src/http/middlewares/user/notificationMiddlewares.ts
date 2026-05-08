import { NextFunction, Request, Response } from 'express'

export const notificationMiddleware = {
  getNotififcations: (req: Request, res: Response, next: NextFunction) => {
    const cursor = String(req.query.cursor)

    const cursorNum = parseInt(cursor, 10)
    const isNum = typeof cursorNum === 'number' && cursorNum > 0

    req.queryMap = { cursor: isNum ? cursorNum : null }
    next()
  },
}
