import z from 'zod'

export const chatValidator = {
  createOrFindPrivateChatBody: z.object({
    secondUserId: z
      .number('Second user id must be number')
      .nonnegative('Second user id nust be a natural number'),
  }),
}
