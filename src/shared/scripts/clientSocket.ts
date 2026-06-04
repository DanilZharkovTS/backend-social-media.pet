import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NywiZW1haWwiOiJncnRkckBhaXRkZGwuY29jbWZmZiIsInJvbGUiOiJ1c2VyIiwic2Vzc2lvblR5cGUiOiJub3JtYWwiLCJpYXQiOjE3ODA2MDcxODQsImV4cCI6MTc4MDYwODA4NH0.1U3h_KFYCcDMpC63z6EXyLn9YVVovKlml6bqQrrkTbA',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)

  setTimeout(() => {
    socket.emit('session:revoke_all')
  }, 500)

  socket.on('session:revoked', (data) => {
    console.log('Sessions revoked: ', data)
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
