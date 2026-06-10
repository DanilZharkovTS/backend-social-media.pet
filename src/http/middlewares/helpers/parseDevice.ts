import { Request, Response, NextFunction } from 'express'
import { UAParser } from 'ua-parser-js'

export const parseDevice = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userAgent = req.headers['user-agent']
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  const browser = result.browser.name
  const model = result.device.model
  const deviceType = result.device.type
  const os = result.os.name

  if (model && deviceType === 'mobile') {
    req.device = browser ? `${model} ${browser}` : model
    next()
    return
  }

  req.device = browser && os ? `${browser} on ${os}` : 'Unknown device'
  next()
}
