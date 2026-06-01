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

export const validateRegisterUser = z.object({
  email: z.email('Not a valid email'),
  password: passwordSchema,
  confirmPassword: z.string('Password confirmation need to be a string'),
  name: z.string('Name needs to be a string').min(1, 'Name is required'),
})

export const validateLoginUser = z.object({
  email: z.email('Not a valid email'),
  password: passwordSchema,
})

export const validatePasswordBody = z.object({
  password:  z
    .string('Password needs to be a string')
    .min(1, 'Password is required'),
})

export const validateVerifyEmail = z.object({
  emailToken: z.string('Token needs to be a string'),
})

export const validateForgotPassword = z.object({
  email: z.email('Not a valid email'),
})

export const validateLoginEmailConfirm = z.object({
  loginEmailConfirmToken: z.string('Token needs to be a string'),
  loginEmailConfirmCode: z.number('Token needs to be a number')
})

export const validateRequestChangeEmail = z.object({
  password: passwordSchema,
  newEmail: z.email('Not a valid email'),
})

export const validateChangeEmail = z.object({
  emailChangeToken: z.string('Token needs to be a string'),
})

export const validateResetPasswordQuery = z.object({
  resetPasswordToken: z.string('Token needs to be a string'),
})

export const validateResetPasswordBody = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string('Password confirmation needs to be a string'),
})

export const validateGetAuthProviderUrl = z.object({
  provider: z.enum(['google'], 'Provider must be google'),
})
