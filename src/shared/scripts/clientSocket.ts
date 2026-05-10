import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc4NDQ1OTA5LCJleHAiOjE3Nzg0NDY4MDl9.4rwHzgMHJM3VWsOg_QAFVUSZU5_loA3dJKKqhbYlpTg',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })

  setTimeout(() => {
    socket.emit('peep:updateReaction', { chatId: 20, peepId: 1279, emoji: '💯' })
  }, 500)

  socket.on('notifications:new', (data) => {
    console.log('New notification: ', data)
  })
  socket.on('notifications:countUpdated', (data) => {
    console.log('Notifications count updated: ', data);
    
  })
})
