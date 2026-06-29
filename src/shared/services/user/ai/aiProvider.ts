import { openAiProvider } from './openAiProvider'

const generateRepliesHandler = {
  openAi: openAiProvider.generateReplies,
}

export const aiProvider = {
  generateReplies: async (peeps: string[], count: number) => {
    const provider = process.env.AI_PROVIDER
    const handler = generateRepliesHandler[provider]

    if (!handler) return

    const replies = await handler(peeps, count)

    return replies
  },
}
