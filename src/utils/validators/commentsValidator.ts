import z from 'zod'

export const validateAddComment = z.object({
  content: z
    .string('Content of the comment needs to be a string')
    .min(1, 'Min. content length is 1')
    .max(80, 'Max. content length is 40 symbols'),
})

export const validateUpdateComment = z.object({
  name: z
    .string('Name needs to be a string')
    .min(4, 'Min. name length is 4 symbols')
    .max(20, 'Max. name length is 20 symbols'),
  content: z
    .string('Content of the comment needs to be a string')
    .min(1, 'Min. content length is 1')
    .max(40, 'Max. content length is 40 symbols')
    .optional(),
})

export const validateDeleteComment = z.object({
  name: z
    .string('Name needs to be a string')
    .min(4, 'Min. name length is 4 symbols')
    .max(20, 'Max. name length is 20 symbols'),
})
