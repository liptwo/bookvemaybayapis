import { Server } from 'socket.io'
import { corsOptions } from './cors.js'
import { userModel } from '~/models/userModel.js'
import { chatService } from '~/services/chatService.js'
// import { configureChatSocket } from '~/sockets/chatSocket.js'

let io

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173', // Địa chỉ của frontend, thay đổi nếu cần
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log(`A user connected with socket id: ${socket.id}`)

    // Lấy thông tin user từ handshake
    const { userId, userRole } = socket.handshake.auth

    // Admin join admin room
    if (userRole === userModel.USER_ROLES.ADMIN) {
      socket.join('admin_room')
      console.log(`Admin ${userId} joined admin_room`)
    }

    // Join conversation
    socket.on('join-conversation', ({ conversationId }) => {
      socket.join(conversationId)
      console.log(`User joined conversation: ${conversationId}`)
    })
    // Gửi tin nhắn
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, content } = data
        const senderId =
          userRole === userModel.USER_ROLES.ADMIN ? userId : socket.id

        const messageData = {
          conversationId,
          senderId,
          senderRole: userRole || 'client',
          content
        }

        await chatService.postMessage(messageData)
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: error.message })
      }
    })

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
