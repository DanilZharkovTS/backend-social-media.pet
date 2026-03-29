import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0Nzk2NTI0LCJleHAiOjE3NzQ3OTc0MjR9.kn5mCD3OAw10hDOuA0pL7hjbdysrD3lNx8qVn1CQ8bc',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 13 })
  setTimeout(() => {
    socket.emit('addPeep', { chatId: 13, content: 'Hello' })
  }, 500)
})
