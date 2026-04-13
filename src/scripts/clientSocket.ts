import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc2MTE4OTk5LCJleHAiOjE3NzYxMTk4OTl9.NN5YzTOW2LRwJj7byWcsMOQIvXPzJirUhRxaCr8STZQ',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })
  setTimeout(() => {
    socket.emit('readPeeps', {chatId: 20, peepId: 592})
    
  }, 500)
})
