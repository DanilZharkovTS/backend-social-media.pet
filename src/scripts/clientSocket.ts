import io from 'socket.io-client'

const socket = io(`http://localhost:3000`, { auth: 'JWT_HERE' })

socket.on('connect', () => {
  console.log(`Connected ${socket.id}`)
})
