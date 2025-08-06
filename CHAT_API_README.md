# Chat API Documentation

## Tổng quan
Hệ thống chat hỗ trợ real-time communication giữa client và admin thông qua Socket.IO và REST API.

## Các tính năng chính
- ✅ Bắt đầu cuộc trò chuyện mới (client)
- ✅ Tham gia cuộc trò chuyện (admin)
- ✅ Gửi tin nhắn real-time (client & admin)
- ✅ Lấy lịch sử tin nhắn
- ✅ Xem danh sách cuộc trò chuyện đang mở (admin)
- ✅ Đóng cuộc trò chuyện (admin)
- ✅ Rời khỏi cuộc trò chuyện (admin)

## REST API Endpoints

### 1. Bắt đầu cuộc trò chuyện mới
```http
POST /v1/chat/start
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com"
}
```

**Response:**
```json
{
  "_id": "conversation_id",
  "clientInfo": {
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com"
  },
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Lấy lịch sử tin nhắn
```http
GET /v1/chat/{conversationId}/history
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "conversation": {
    "_id": "conversation_id",
    "clientInfo": {...},
    "adminId": "admin_id",
    "status": "active"
  },
  "messages": [
    {
      "_id": "message_id",
      "conversationId": "conversation_id",
      "senderId": "sender_id",
      "senderRole": "client",
      "content": "Xin chào!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Gửi tin nhắn (Admin only)
```http
POST /v1/chat/{conversationId}/message
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "Xin chào! Tôi có thể giúp gì cho bạn?"
}
```

### 4. Xem danh sách cuộc trò chuyện đang mở (Admin only)
```http
GET /v1/chat/open
Authorization: Bearer {accessToken}
```

### 5. Đóng cuộc trò chuyện (Admin only)
```http
PUT /v1/chat/{conversationId}/close
Authorization: Bearer {accessToken}
```

## Socket.IO Events

### Client Events (Gửi từ client)

#### 1. Tham gia cuộc trò chuyện
```javascript
socket.emit('join-conversation', { conversationId: 'conversation_id' })
```

#### 2. Gửi tin nhắn
```javascript
socket.emit('client:send-message', {
  conversationId: 'conversation_id',
  content: 'Nội dung tin nhắn'
})
```

### Admin Events (Gửi từ admin)

#### 1. Tham gia cuộc trò chuyện
```javascript
// Kết nối với auth data
const socket = io('/chat', {
  auth: {
    userId: 'admin_user_id',
    userRole: 'admin'
  }
})

socket.emit('join-conversation', { conversationId: 'conversation_id' })
```

#### 2. Gửi tin nhắn
```javascript
socket.emit('client:send-message', {
  conversationId: 'conversation_id',
  content: 'Nội dung tin nhắn'
})
```

#### 3. Rời khỏi cuộc trò chuyện
```javascript
socket.emit('admin:leave-conversation', { conversationId: 'conversation_id' })
```

#### 4. Đóng cuộc trò chuyện
```javascript
socket.emit('admin:close-conversation', { conversationId: 'conversation_id' })
```

### Server Events (Nhận từ server)

#### 1. Tin nhắn mới
```javascript
socket.on('server:receive-message', (message) => {
  console.log('Tin nhắn mới:', message)
})
```

#### 2. Admin tham gia
```javascript
socket.on('server:admin-joined', (conversation) => {
  console.log('Admin đã tham gia:', conversation)
})
```

#### 3. Admin rời đi
```javascript
socket.on('server:admin-left', (conversation) => {
  console.log('Admin đã rời đi:', conversation)
})
```

#### 4. Cuộc trò chuyện đóng
```javascript
socket.on('server:conversation-closed', (conversation) => {
  console.log('Cuộc trò chuyện đã đóng:', conversation)
})
```

#### 5. Cuộc trò chuyện mới (Admin only)
```javascript
socket.on('server:new-conversation-pending', (conversation) => {
  console.log('Cuộc trò chuyện mới:', conversation)
})
```

#### 6. Cập nhật cuộc trò chuyện (Admin only)
```javascript
socket.on('server:conversation-updated', (conversation) => {
  console.log('Cuộc trò chuyện được cập nhật:', conversation)
})
```

## Trạng thái cuộc trò chuyện

- `pending`: Đang chờ admin trả lời
- `active`: Đang trong cuộc trò chuyện
- `closed`: Đã kết thúc

## Lưu ý quan trọng

1. **Authentication**: Admin cần có access token hợp lệ để truy cập các API được bảo vệ
2. **Socket Connection**: Admin cần kết nối socket với auth data (userId, userRole)
3. **Real-time**: Tin nhắn được gửi real-time qua Socket.IO
4. **Error Handling**: Tất cả các event đều có error handling và emit error events
5. **Room Management**: Mỗi cuộc trò chuyện là một "room" riêng biệt

## Ví dụ sử dụng

### Frontend Client
```javascript
// Kết nối socket
const socket = io('/chat')

// Bắt đầu cuộc trò chuyện
const response = await fetch('/v1/chat/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com'
  })
})
const conversation = await response.json()

// Tham gia cuộc trò chuyện
socket.emit('join-conversation', { conversationId: conversation._id })

// Gửi tin nhắn
socket.emit('client:send-message', {
  conversationId: conversation._id,
  content: 'Xin chào!'
})

// Nhận tin nhắn
socket.on('server:receive-message', (message) => {
  console.log('Tin nhắn mới:', message)
})
```

### Frontend Admin
```javascript
// Kết nối socket với auth
const socket = io('/chat', {
  auth: {
    userId: 'admin_user_id',
    userRole: 'admin'
  }
})

// Tham gia cuộc trò chuyện
socket.emit('join-conversation', { conversationId: 'conversation_id' })

// Gửi tin nhắn
socket.emit('client:send-message', {
  conversationId: 'conversation_id',
  content: 'Tôi có thể giúp gì cho bạn?'
})

// Nhận thông báo cuộc trò chuyện mới
socket.on('server:new-conversation-pending', (conversation) => {
  console.log('Có cuộc trò chuyện mới:', conversation)
})
``` 