import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc3MTQ3MzkyLCJleHAiOjE3NzcxNDgyOTJ9.qMzTfNGdBZCGlXa2FTvn8bvhjdPRQv4wS3N4-BVUm1A',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })
  setTimeout(() => {
    socket.emit('chat:setChatAutoDelete', {chatId: 20, interval: null})
  }, 500)

})
