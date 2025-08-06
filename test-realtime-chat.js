import { io } from 'socket.io-client'

const API_BASE = 'http://localhost:8017'

async function testRealtimeChat() {
  console.log('🧪 Testing real-time chat updates...\n')

  try {
    // Test 1: Admin socket connection
    console.log('1. Testing admin socket connection')
    const adminSocket = io(`${API_BASE}/chat`, {
      auth: {
        userId: '688a6dd5efbbf3ced20fd7ef', // Admin user ID
        userRole: 'admin'
      }
    })

    adminSocket.on('connect', () => {
      console.log('✅ Admin socket connected')
    })

    adminSocket.on('server:new-conversation-pending', (conversation) => {
      console.log('🔔 Admin received new conversation:', conversation._id)
    })

    // Test 2: Create new conversation
    console.log('\n2. Testing new conversation creation')
    const response = await fetch(`${API_BASE}/v1/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com'
      })
    })

    const conversation = await response.json()
    console.log('✅ New conversation created:', conversation._id)

    // Wait a bit for socket events
    setTimeout(() => {
      console.log('\n✅ Real-time test completed!')
      adminSocket.disconnect()
      process.exit(0)
    }, 3000)

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testRealtimeChat() 