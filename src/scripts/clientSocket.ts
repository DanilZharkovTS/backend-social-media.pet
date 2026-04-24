import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc3MDY1ODg2LCJleHAiOjE3NzcwNjY3ODZ9.CxRyPgu1PXedz8Qqu0HKh5p3Hyo4Vpv9_IKItD6FAa0',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
  socket.emit('joinChat', { chatId: 20 })
  setTimeout(() => {
    socket.emit('chat:setChatAutoDelete', {chatId: 20, interval: '1 week'})
  }, 500)

})
