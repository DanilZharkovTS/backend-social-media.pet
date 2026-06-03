import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NywiZW1haWwiOiJncnRkckBhaXRkZGwuY29jbWZmZiIsInJvbGUiOiJ1c2VyIiwic2Vzc2lvblR5cGUiOiJub3JtYWwiLCJpYXQiOjE3ODA1MTk4MTIsImV4cCI6MTc4MDUyMDcxMn0.ppDLEROUmnMnnuPgVNOJ04vT0-8_dQsDT_opXS_b4rE',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)

  setTimeout(() => {
    socket.emit('session:revoke', { sessionId: 52 })
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
