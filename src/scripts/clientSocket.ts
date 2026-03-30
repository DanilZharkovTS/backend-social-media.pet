import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0ODczMjQ3LCJleHAiOjE3NzQ4NzQxNDd9.38r_nS6wrCSLP5b4COe9XgkMFCHlyW_EBDz3Qu70sRM',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 13 })
  setTimeout(() => {
    socket.emit('editPeep', { peepId: 22, content: 'Hello edit' })
  }, 500)
})
 