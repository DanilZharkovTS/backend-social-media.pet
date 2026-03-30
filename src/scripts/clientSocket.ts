import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0ODc2MDczLCJleHAiOjE3NzQ4NzY5NzN9.Xtwvh1zCq9uFcB2rRYEr0kISmCNthi9NTlQHXrG4U1U',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 13 })
  setTimeout(() => {
    socket.emit('deletePeep', { peepId: 6, content: 'Hello edit' })
  }, 500)
})
 