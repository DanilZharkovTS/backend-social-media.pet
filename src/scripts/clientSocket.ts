import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, {
  auth: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFkbWlua2FAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0NTM4MTIyLCJleHAiOjE3NzQ1MzkwMjJ9.fWklauxZ3eiBHrCRRmn5s5fOqLvqOL7txCm4oeDmh-o',
  },
})

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
})
