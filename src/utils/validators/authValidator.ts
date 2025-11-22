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
  name: z.string('Name needs to be a string').min(1, 'Name is required'),
})

export const validateLoginUser = z.object({
  email: z.email('Not a valid email'),
  password: passwordSchema,
})
