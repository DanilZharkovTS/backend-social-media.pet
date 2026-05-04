import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc3OTI4MzUwLCJleHAiOjE3Nzc5MjkyNTB9.f2lBzazAzpofrECPh7IBfaGv-9b5T6n_DHYpoJZhQHA',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })
  setTimeout(() => {
    socket.emit('addPeep', { chatId: 20, content: 'hello', replyTo: 1076 })
  }, 500)
  socket.on('newPeep', (data) => {
    console.log(data)
  })
})
