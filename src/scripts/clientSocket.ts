import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0NTY1OTY4LCJleHAiOjE3NzQ1NjY4Njh9.d5LDW-qFu_fgDw-813kgMJSS1gNjbR_9NSjHVcebpuw',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', {chatId: 13})
})
