import z from 'zod'

export const validateAddPost = z.object({
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


export const validateFindPost = z.object({
  search: z.string('Search needs to be a string').optional(),
})

export const validateMediaIdBody = z.object({
  mediaId: z.number('Media id needs to be a number').min(1, 'Valid media id is required'),
})
