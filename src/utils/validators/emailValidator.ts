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

export const validateVerifyEmail = z.object({
  emailToken: z.string('Token needs to be a string'),
})

export const validateForgotPassword = z.object({
  email: z.email('Not a valid email'),
})

export const validateRequestChangeEmail = z.object({
  newEmail: z.email('Not a valid email'),
})

export const validateResetPasswordQuery = z.object({
  resetPasswordToken: z.string('Token needs to be a string'),
})

export const validateResetPasswordBody = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string('Password confirmation needs to be a string'),
})
