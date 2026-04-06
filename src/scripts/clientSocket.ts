import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc1NDE0NTg4LCJleHAiOjE3NzU0MTU0ODh9.go6i8ZqDFmiumJ0nEBDJEuI28y7v0mpl1AzmvS-DpaE',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })
  setTimeout(() => {
    socket.emit('addPeep', { chatId: 20, content: 'Hello' })
    
  }, 500)
})
