import type { NextFunction, Request, Response } from 'express'
import type { updateMyInfoDTO } from '../../interfaces/user/userInterfaces.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import {
  validateFindUser,
  validateUpdateEmail,
  validateUpdateMyAvatar,
  validateUpdateMyInfo,
  validateUpdatePassword,
} from '../../utils/validators/userValidator.ts'
import { buildUpdateData } from '../../utils/helpers/builders/buildUpdateData.ts'

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
      throw ApiError('Birth date is unrealistic', 400)
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
        throw ApiError('No data provided to update', 400)
      }

      req.body = { fields, values }
      next()
    } catch (err) {
      next(err)
    }
  },
  updateMyEmail: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateUpdateEmail.parse(req.body)

      next()
    } catch (err) {
      next(err)
    }
  },
  updateMyPassword: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateUpdatePassword.parse(req.body)

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

  //admin

  findAsAdmin: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = validateFindUser.parse(req.query)
      const search = validData.search ? `%${validData.search}%` : null

      req.queryMap = { search }
      next()
    } catch (err) {
      next(err)
    }
  },
}
