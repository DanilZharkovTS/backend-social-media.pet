import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc3NDY0NzE5LCJleHAiOjE3Nzc0NjU2MTl9.3Go3SgeRoBcCzNb3a4HpPiOBHRzaHGHsLMBbfGxH5ko',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })
  setTimeout(() => {
    socket.emit('peep:updateReaction', { chatId: 20, peepId: 795, emoji: '🔥' })
  }, 500)
})
