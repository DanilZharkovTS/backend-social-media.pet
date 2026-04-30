import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc3NTgxNjQ4LCJleHAiOjE3Nzc1ODI1NDh9.XHsBGCoRyUI2B188fThfBzxU2qyVZYlWmbYxtIOfjg4',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })
  setTimeout(() => {
    socket.emit('peep:updateReaction', { chatId: 20, peepId: 800, emoji: '🔥' })
  }, 500)
  socket.on('peeps:updateReaction', (data) => {
    console.log(data)
  })
})
