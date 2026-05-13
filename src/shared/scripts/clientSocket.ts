import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc4NzEyMTcyLCJleHAiOjE3Nzg3MTMwNzJ9.cV8mnRdj99TdW-voYK3c9UjiG5HV38lx9VwZq_9XadU',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })

  setTimeout(() => {
    socket.emit('chat:notifications:open_all', { chatId: 20 })
  }, 500)

  socket.on('chat:notifications:opened_all', (data) => {
    console.log('Opened chat notifications: ', data)
  })

  socket.on('notifications:new', (data) => {
    console.log('New notification: ', data)
  })
  socket.on('notifications:countUpdated', (data) => {
    console.log('Notifications count updated: ', data)
  })
})
