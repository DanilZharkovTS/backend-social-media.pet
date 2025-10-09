import type { NextFunction, Request, Response } from 'express'

export const setParamsId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id
    const idInt = parseInt(String(id), 10)

    if (isNaN(idInt) || idInt < 1) {
      return res.status(400).json({ error: 'Id needs to be a natural number' })
    }

    req.paramsId = { id: idInt }
    next()
  } catch (err) {
    next(err)
  }
}
