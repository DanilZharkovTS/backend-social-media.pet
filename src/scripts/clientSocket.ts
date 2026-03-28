import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0NzMyNzA3LCJleHAiOjE3NzQ3MzM2MDd9.T5QyQTPSTg6ujOYwwxpRmbIknYbL8KVhNwxHLhggWW8',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`) 
  socket.emit('joinChat', { chatId: 13 })
  setTimeout(() => {
    socket.emit('leaveChat', {chatId: 13})
  }, 500)
})
