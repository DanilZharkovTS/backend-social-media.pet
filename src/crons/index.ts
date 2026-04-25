import cron from 'node-cron'
import { chatPeepService } from '../services/user/chat/chatPeepService'
import { io } from '../app'
import { getRedis } from '../lib/redisClient'

cron.schedule('* * * * *', async () => {
  const redis = getRedis()

  const result = await chatPeepService.autoDeletePeeps()

  if (!result) return

  const { byChatId } = result
  console.log(byChatId)

  for (const [chatId, peepIds] of Object.entries(byChatId)) {
    await redis.del(`chats:${chatId}:peeps`)
    io.to(`chats:${chatId}`).emit('peeps:deleted', { peepIds })
  }
})
