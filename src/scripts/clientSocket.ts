import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc2MTc4Nzc0LCJleHAiOjE3NzYxNzk2NzR9.J_-q_svqhR3YPUlx6stl0YDHXaWwfg2xVbBVx9lf5Ws',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })
  setTimeout(() => {
    socket.emit('readPeeps', { chatId: 20, peepId: 635 })
  }, 500)
  socket.on('readPeeps', (data) => {
    console.log(data)
  })
})
