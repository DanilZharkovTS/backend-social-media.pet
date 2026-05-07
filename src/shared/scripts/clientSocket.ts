import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc4MTkzMjcyLCJleHAiOjE3NzgxOTQxNzJ9.lbBgar1XQKNW69MuNWXD0YhnFi_yU-LWv8sFj2k2l20',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })

  setTimeout(() => {
    socket.emit('addPeep', { chatId: 20, content: 'hello', replyTo: 1261 })
  }, 500)
  socket.on('newPeep', (data) => {
    console.log(data)
  })
})
