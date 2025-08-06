import { Server } from 'socket.io'
import { corsOptions } from './cors.js'
import { configureChatSocket } from '~/sockets/chatSocket.js'

let io

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173', // Địa chỉ của frontend, thay đổi nếu cần
      methods: ['GET', 'POST']
    }
  })

  // Cấu hình chat socket
  configureChatSocket(io)

  io.on('connection', (socket) => {
    console.log(`A user connected with socket id: ${socket.id}`)

    // Lắng nghe sự kiện khi người dùng tham gia vào "phòng" riêng của họ
    // Frontend sẽ gửi sự kiện này cùng với userId sau khi đăng nhập
    socket.on('user:join-room', (userId) => {
      console.log(`User with id ${userId} joined their private room.`)
      socket.join(userId)
    })

    socket.on('disconnect', () => {
      console.log(`User with socket id: ${socket.id} disconnected.`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!')
  }
  return io
}
