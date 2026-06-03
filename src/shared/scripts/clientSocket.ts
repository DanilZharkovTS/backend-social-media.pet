import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NywiZW1haWwiOiJncnRkckBhaXRkZGwuY29jbWZmZiIsInJvbGUiOiJ1c2VyIiwic2Vzc2lvblR5cGUiOiJub3JtYWwiLCJpYXQiOjE3ODA1MjE1NjEsImV4cCI6MTc4MDUyMjQ2MX0.LtiDWwe1JVtxK0twXsk4Ae0XBxG87C0zB3Gl1xEsrHM',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)

  setTimeout(() => {
    socket.emit('session:revoke', { sessionId: 54 })
  }, 500)

  socket.on('session:revoked', (data) => {
    console.log('Session revoked id: ', data.id)
  })

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
