import type { NextFunction, Request, Response } from 'express'

export const setParamsId = (paramsNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validParams: Record<string, number> = {}
      for (const name of paramsNames) {
        const row = req.params[name]
        const num = parseInt(String(row), 10)

        if (isNaN(num) || num < 1) {
          return res.status(400).json({
            error: `Param ${name}: ${num} needs to be a natural number`,
          })
        }
        validParams[name] = num
      }
      req.paramsMap = validParams
      next()
    } catch (err) {
      next(err)
    }
  }
}
