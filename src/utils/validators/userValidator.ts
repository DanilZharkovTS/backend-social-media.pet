import z from 'zod'

const passwordSchema = z
  .string()
  .min(10, { message: 'Password must be at least 10 characters long' })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least one special character',
  })

export const validateUpdateMyInfo = z.object({
  name: z
    .string('Name needs to be a string')
    .min(1, 'Name is required')
    .optional(),
  bio: z.string('Bio needs to be a string').optional(),
})

export const validateUpdatePassword = z.object({
  oldPassword: z.string('Old password needs to be a string'),
  newPassword: passwordSchema
})

export const validateUpdateMyAvatar = z.object({
  avatar_url: z.string('Avatar url needs to be a string')
})
