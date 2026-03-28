import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0Njk1MTY0LCJleHAiOjE3NzQ2OTYwNjR9.14eh-Wd3OHoF98wCwMWKwKtMvdFtkukEi3D59Ob4k6I',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`) 
  socket.emit('joinChat', {chatId: 0 })
})
