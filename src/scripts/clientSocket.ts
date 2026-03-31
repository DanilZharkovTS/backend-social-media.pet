import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0OTk4Njk1LCJleHAiOjE3NzQ5OTk1OTV9._MIpuFb335diAMLqOYReWl6Ii3wM5gy9tppPxd7_b-4',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 13 })
  setTimeout(() => {
    socket.emit('typing', { chatId: 13 })
    setTimeout(() => {
      socket.emit('stopTyping', { chatId: 13 })
    }, 500)
  }, 500)
})
