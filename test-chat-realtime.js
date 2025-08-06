import { io } from 'socket.io-client'

const API_BASE = 'http://localhost:8017'

async function testChatRealtime() {
  console.log('🧪 Testing chat real-time...\n')

  try {
    // Test 1: Admin socket connection
    console.log('1. Admin connecting...')
    const adminSocket = io(`${API_BASE}/chat`, {
      auth: {
        userId: '688a6dd5efbbf3ced20fd7ef',
        userRole: 'admin'
      }
    })

    adminSocket.on('connect', () => {
      console.log('✅ Admin connected')
    })

    adminSocket.on('new-conversation', (conversation) => {
      console.log('🔔 Admin received new conversation:', conversation._id)
      console.log('Client name:', conversation.clientInfo?.name)
      console.log('Client email:', conversation.clientInfo?.email)
    })

    // Test 2: Create conversation
    console.log('\n2. Creating conversation...')
    const response = await fetch(`${API_BASE}/v1/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com'
      })
    })

    const conversation = await response.json()
    console.log('✅ Conversation created:', conversation._id)

    // Wait for socket event
    setTimeout(() => {
      console.log('\n✅ Test completed!')
      adminSocket.disconnect()
      process.exit(0)
    }, 3000)

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testChatRealtime() 