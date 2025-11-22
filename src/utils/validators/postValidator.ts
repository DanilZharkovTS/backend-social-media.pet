import z from 'zod'

export const validateAddPost = z.object({
  name: z
    .string('Name needs to be a string')
    .min(4, 'Min. name length is 4 symbols')
    .max(20, 'Max. name length is 20 symbols'),
  description: z
    .string('Description of the post needs to be a string')
    .min(1, 'Min. description length is 1')
    .max(40, 'Max. description length is 40 symbols'),
})

export const validateUpdatePost = z.object({
  description: z
    .string('Description of the post needs to be a string')
    .min(1, 'Min. description length is 1')
    .max(40, 'Max. description length is 40 symbols')
    .optional(),
})

export const validateDeletePost = z.object({
  name: z
    .string('Name needs to be a string')
    .min(4, 'Min. name length is 4 symbols')
    .max(20, 'Max. name length is 20 symbols'),
})

export const validateFindPost = z.object({
  search: z
    .string('Search needs to be a string')
    .optional(),
})