import type { NextFunction, Request, Response } from 'express'
import { PaginationType } from '../../../shared/interfaces/global/index'

export const paginate = (type: PaginationType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    switch (type) {
      case 'cursor':
        const cursor = String(req.query.cursor)

        const cursorNum = parseInt(cursor, 10)
        const isNum = typeof cursorNum === 'number' && cursorNum > 0

        req.pagination = { cursor: isNum ? cursorNum : null }
        break
      case 'offset':
        let pageStr = req.query.page
        let limitStr = req.query.limit

        pageStr = Array.isArray(pageStr) ? pageStr[0] : pageStr
        limitStr = Array.isArray(limitStr) ? limitStr[0] : limitStr

        let pageInt = parseInt(String(pageStr) || '1', 10)
        let limitInt = parseInt(String(limitStr) || '1', 10)

        if (isNaN(pageInt) || pageInt < 1) pageInt = 1
        if (isNaN(limitInt) || limitInt < 1 || limitInt > 50) limitInt = 50

        const offsetInt = (pageInt - 1) * limitInt

        const start = -(pageInt * limitInt)
        const end = -((pageInt - 1) * limitInt + 1)

        req.pagination = {
          page: pageInt,
          offset: offsetInt,
          limit: limitInt,
          start,
          end,
        }
        break
    }
    next()
  }
}
