import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc2NzY3Mzc5LCJleHAiOjE3NzY3NjgyNzl9.xbqPROTDwWDRNJVQhYAac-eBg9eTqaBv6gkY2sMZMws',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })
  setTimeout(() => {
    socket.emit('onlineUser', { chatId: 20 })
    console.log('here');
    
  }, 500)

})
