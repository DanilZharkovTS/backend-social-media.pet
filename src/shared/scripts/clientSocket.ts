import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc4MjYxMDg0LCJleHAiOjE3NzgyNjE5ODR9.fdLVV1yWA7iX_NNV25IwK27gAQ6rZ4kqkoP7RK-mMBg',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })

  setTimeout(() => {
    socket.emit('notification:open', {  notificationId: 99 })
  }, 500)

  socket.on('notification:opened', (data) => {
    console.log(data)
  })
})
