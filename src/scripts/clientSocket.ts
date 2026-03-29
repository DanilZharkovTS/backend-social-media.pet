import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0ODE1NjgzLCJleHAiOjE3NzQ4MTY1ODN9.88MvTdkxtfr6qBh0dBqd_mrb5a6eeC6zmZqsx7V0zZc',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 13 })
  setTimeout(() => {
    socket.emit('addPeep', { chatId: 13, content: 'Hi' })
  }, 500)
})
