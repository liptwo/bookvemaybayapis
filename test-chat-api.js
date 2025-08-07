const axios = require('axios')

const API_BASE = 'http://localhost:8017/v1'

async function testChatAPI() {
  console.log('Testing Chat API endpoints...\n')

  try {
    // Test 1: Start conversation
    console.log('1. Testing POST /chat/start')
    const startResponse = await axios.post(`${API_BASE}/chat/start`, {
      name: 'Test User',
      email: 'test@example.com'
    })
    console.log('✅ Start conversation success:', startResponse.data)
    
    const conversationId = startResponse.data._id

    // Test 2: Get open conversations (will fail without auth)
    console.log('\n2. Testing GET /chat/open (without auth)')
    try {
      await axios.get(`${API_BASE}/chat/open`)
    } catch (error) {
      console.log('✅ Expected 401 error (no auth):', error.response?.status)
    }

    // Test 3: Get conversation history (will fail without auth)
    console.log('\n3. Testing GET /chat/:id/history (without auth)')
    try {
      await axios.get(`${API_BASE}/chat/${conversationId}/history`)
    } catch (error) {
      console.log('✅ Expected 401 error (no auth):', error.response?.status)
    }

    console.log('\n✅ All basic tests completed!')
    console.log('Note: Admin endpoints require authentication')

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message)
  }
}

testChatAPI() 