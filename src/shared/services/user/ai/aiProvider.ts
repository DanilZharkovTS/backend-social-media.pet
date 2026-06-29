import OpenAI from 'openai'

export const aiProvider = {
  generateReplies: async (peep: string, count: number) => {
    console.log(process.env.AI_BASE_URL)

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

      The other person wrote:

      "${peep}"

      Generate exactly ${count} natural, short replies.

      Rules:
      - Return only valid JSON.
      - English
      - No markdown.
      - No explanations.
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
