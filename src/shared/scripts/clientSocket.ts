import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc4MzYxMzExLCJleHAiOjE3NzgzNjIyMTF9.POs5auYPZcnW69N-xaw7yyaiCKpGrQcC6rYwnvjUUb0',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })

  setTimeout(() => {
    socket.emit('notifications:readUpTo', {  lastReadNotificationId: 84 })
  }, 500)

  socket.on('notifications:readUpToSuccess', (data) => {
    console.log(data)
  })
})
