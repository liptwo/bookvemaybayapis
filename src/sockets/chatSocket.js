import { chatService } from '~/services/chatService.js'
import { userModel } from '~/models/userModel.js'

export const configureChatSocket = (io) => {
  const chatNamespace = io.of('/chat')

  chatNamespace.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

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

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
    })
  })
}
