const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)

// Cấu hình CORS để React app (chạy ở port 3000) có thể kết nối
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// --- Các route API của Express ---
// app.get('/api/trips/:tripId', tripController.getTripDetails);
// app.post('/api/bookings', bookingController.createBooking);

// --- Logic xử lý Socket.IO ---
io.on('connection', (socket) => {
  console.log('Một người dùng đã kết nối:', socket.id)

  // Lắng nghe sự kiện khi client muốn tham gia vào phòng của một chuyến xe
  socket.on('join-trip-room', (tripId) => {
    socket.join(tripId) // Cho socket này vào phòng có tên là tripId
    console.log(`Socket ${socket.id} đã tham gia phòng ${tripId}`)
  })

  // Lắng nghe sự kiện khi client chọn một ghế
  socket.on('select-seat', ({ tripId, number, selector }) => {
    // TODO: Viết logic kiểm tra và cập nhật trạng thái ghế trong Database
    // 1. Tìm ghế trong DB với tripId và seatNumber
    // 2. Nếu ghế 'available' -> cập nhật status thành 'selecting', lưu socket.id
    // 3. Thiết lập một setTimeout để giải phóng ghế sau 5 phút

    // Gửi cập nhật đến TẤT CẢ client khác trong cùng phòng
    console.log(selector)
    io.to(tripId).emit('seat-updated', { number, status: 'selecting', selector: selector })
  })
  socket.on('seat-de-select', ({ tripId, number }) => {
    console.log('hello')
    io.to(tripId).emit('seat-updated', { number, status: 'available', selector: '' })
  })

  // Lắng nghe sự kiện khi client ngắt kết nối
  socket.on('disconnect', () => {
    console.log('Người dùng đã ngắt kết nối:', socket.id)
    // TODO: Xử lý giải phóng tất cả các ghế mà user này đang 'selecting'
    // 1. Tìm trong DB tất cả các ghế có 'lockedBy' là socket.id này
    // 2. Cập nhật status của chúng về 'available'
    // 3. Gửi sự kiện 'seat-updated' cho các phòng tương ứng
  })
})

const PORT = 8080
server.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`)
})
