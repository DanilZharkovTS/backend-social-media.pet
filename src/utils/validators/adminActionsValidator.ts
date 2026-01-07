import z from 'zod'

export const validateAdminDeleteUserConfirm = z.object({
  adminDeleteUserToken: z.string('Token needs to be a string')
})

export const validateRequestAdminDeleteUser = z.object({
  password: z.string('Password needs to be a string'),
})
