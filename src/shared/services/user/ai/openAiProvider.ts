import OpenAI from "openai"

export const openAiProvider = {
  generateReplies: async (peeps: string[], count: number) => {
    const client = new OpenAI({
      baseURL: process.env.AI_BASE_URL,
      apiKey: process.env.AI_API_KEY,
    })
    const res = await client.responses.create({
      model: process.env.AI_MODEL,
      input: `
      You are an AI assistant for a messenger.

      You are NOT talking to the user.

      Your task is to generate reply suggestions that the sender could send to another person in a private chat.

      If the last message asks about personal activities, events, experiences, or opinions (e.g. "What are you doing?", "How did your meeting go yesterday?"), generate generic, natural replies that do not invent specific facts unless they are provided in the conversation context.

      Be friendly and like real person

      The other person wrote:

      "${peeps.join('\n')}"

      Generate exactly ${count} natural, short replies.

      Rules:
      - Return only valid JSON.
      - Use the language that another person is using.
      - Use slang when needed
      - Use word shortening when needed
      - No markdown.
      - No explanations.
      - Be very fast 
      - The format must be:

      {
        "replies": [
          "reply 1",
          "reply 2",
          "reply 3"
        ]
      }
      `,
    })

    return JSON.parse(res.output_text)
  },
}
