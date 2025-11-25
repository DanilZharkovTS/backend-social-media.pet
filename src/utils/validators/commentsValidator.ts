import z from 'zod'

export const validateAddComment = z.object({
  content: z
    .string('Content of the comment needs to be a string')
    .min(1, 'Min. content length is 1')
    .max(80, 'Max. content length is 40 symbols'),
})

export const validateUpdateComment = z.object({
  content: z
    .string('Content of the comment needs to be a string')
    .min(1, 'Min. content length is 1')
    .max(40, 'Max. content length is 40 symbols')
    .optional(),
})
