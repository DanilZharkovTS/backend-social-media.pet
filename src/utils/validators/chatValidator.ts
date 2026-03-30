import z from 'zod'

export const chatValidator = {
  createOrFindPrivateChatBody: z.object({
    secondUserId: z
      .number('Second user id must be number')
      .nonnegative('Second user id nust be a natural number'),
  }),
  addPeepBody: z.object({
    content: z
      .string('Content need to be a string')
      .min(1, 'Min. content length is 1')
      .max(400, 'Max. content length is 400 symbols'),
  }),
  editPeepBody: z.object({
    content: z
      .string('Content need to be a string')
      .min(1, 'Min. content length is 1')
      .max(400, 'Max. content length is 400 symbols'),
  }),
}
