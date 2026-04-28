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
  findPeepsBody: z.object({
    search: z.string('Search needs to be a string').optional(),
  }),
  editPeepBody: z.object({
    content: z
      .string('Content need to be a string')
      .min(1, 'Min. content length is 1')
      .max(400, 'Max. content length is 400 symbols'),
  }),
  updateChatAutoDeleteSchema: z.object({
    interval: z
      .enum(
        ['1 hour', '1 day', '1 week', '1 month'],
        'Interval needs to be null, 1 hour, 1 day, 1 week or 1 month'
      )
      .nullable(),
  }),
}
