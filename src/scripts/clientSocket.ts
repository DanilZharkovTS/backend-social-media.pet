import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0NzMxNjk2LCJleHAiOjE3NzQ3MzI1OTZ9.tsPU9JahSmv5qneLjPVmBc1ifhG-tcRwMtMk76UozVA',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`) 
  socket.emit('joinChat', { chatId: 1 })
  setTimeout(() => {
    socket.emit('leaveChat', {chatId: 1})
  }, 500)
})
