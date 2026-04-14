import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc2MTYxNTQxLCJleHAiOjE3NzYxNjI0NDF9.WzA1_id6tblZVMUnpaQer7ryu4k9TM8MgG-Oj0nnr7c',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })
  setTimeout((data) => {
    socket.emit('readPeeps', { chatId: 20, peepId: 598 })
  }, 500)
  socket.on('readPeeps', (data) => {
    console.log(data)
  })
})
