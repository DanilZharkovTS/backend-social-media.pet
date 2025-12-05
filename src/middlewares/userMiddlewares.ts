import type { NextFunction, Request, Response } from 'express'
import {
  validateUpdateMyAvatar,
  validateUpdateMyInfo,
} from '../utils/validators/userValidator.ts'
import { buildUpdateData } from '../utils/helpers/builders/buildUpdateData.ts'
import type { updateMyInfoDTO } from '../interfaces/userInterfaces.ts'

export const userMiddlewares = {
  validateBirthDate: (req: Request, res: Response, next: NextFunction) => {
    const { birth_date } = req.body

    if (!birth_date) return next()

    const date = new Date(birth_date)

    if (isNaN(date.getTime())) {
      return res.status(400).json([
        {
          field: 'birth_date',
          message: 'Birth date must be a valid date in format YYYY-MM-DD',
        },
      ])
    }

    const now = new Date()
    if (date > now) {
      return res.status(400).json([
        {
          field: 'birth_date',
          message: 'Birth date cannot be in the future',
        },
      ])
    }

    const age = now.getFullYear() - date.getFullYear()
    if (age > 120) {
      return res.status(400).json([
        {
          field: 'birth_date',
          message: 'Birth date is unrealistic',
        },
      ])
    }

    next()
  },
  updateMyInfo: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData: updateMyInfoDTO = validateUpdateMyInfo.parse(req.body)
      validData.birth_date = req.body.birth_date

      const fields: string[] = []
      const values: string[] & Date[] = []

      buildUpdateData.myInfo(validData, fields, values)

      if (fields.length === 0 || values.length === 0) {
        return res.status(400).json({ err: 'No data provided to update' })
      }

      req.body = { fields, values }
      next()
    } catch (err) {
      next(err)
    }
  },
  updateMyAvatarUrl: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateUpdateMyAvatar.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  },
}
