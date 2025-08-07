import { Server } from 'socket.io'
import { corsOptions } from './cors.js'
import { userModel } from '~/models/userModel.js'
import { chatService } from '~/services/chatService.js'
// import { configureChatSocket } from '~/sockets/chatSocket.js'

let io
// const flightSeats = {}
const flightSeats = {}
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
    // Choose seat
    // socket.on('join:chooseSeat', (flightId) => {
    //   socket.join(flightId)
    //   console.log(`User joined flight: ${flightId}`)
    // })
    // socket.emit('seatUpdate', occupiedSeats)

    // socket.on('holdSeat', (seat) => {
    //   if (!occupiedSeats.includes(seat)) {
    //     occupiedSeats.push(seat)
    //     io.emit('seatUpdate', occupiedSeats)
    //   }
    // })
    socket.on('join', ({ flightId, userId }) => {
      socket.join(flightId)
      socket.data.userId = userId
      socket.data.flightId = flightId

      if (!flightSeats[flightId]) flightSeats[flightId] = {}
      io.to(flightId).emit('seatUpdate', flightSeats[flightId])
    })

    socket.on('selectSeat', ({ seat }) => {
      const { userId, flightId } = socket.data
      if (!flightId || !userId) return

      const seats = flightSeats[flightId]
      if (!seats) return

      // Check if seat is taken by someone else
      if (seats[seat] && seats[seat].userId !== userId) return

      // Release old seat (if any)
      for (const [s, info] of Object.entries(seats)) {
        if (info.userId === userId) delete seats[s]
      }

      // Assign new seat
      seats[seat] = { userId }

      io.to(flightId).emit('seatUpdate', seats)
    })
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
      const { userId, flightId } = socket.data
      if (userId && flightId && flightSeats[flightId]) {
        const seats = flightSeats[flightId]
        for (const [seat, info] of Object.entries(seats)) {
          if (info.userId === userId) delete seats[seat]
        }
        io.to(flightId).emit('seatUpdate', seats)
      }
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
