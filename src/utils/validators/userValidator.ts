import z from 'zod'

export const validateUpdateMyInfo = z.object({
  name: z
    .string('Name needs to be a string')
    .min(1, 'Name is required')
    .optional(),
  bio: z.string('Bio needs to be a string').optional(),
})
