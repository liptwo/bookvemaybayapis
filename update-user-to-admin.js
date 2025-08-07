import { GET_DB } from './src/config/mongodb.js'
import { userModel } from './src/models/userModel.js'

async function updateUserToAdmin(email) {
  try {
    console.log(`🔧 Updating user to admin: ${email}\n`)
    
    // Tìm user theo email
    const user = await userModel.findOneByEmail(email)
    if (!user) {
      console.log(`❌ User not found with email: ${email}`)
      console.log('\n📋 Available users:')
      const allUsers = await GET_DB().collection(userModel.USER_COLLECTION_NAME).find({}).toArray()
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. Email: ${u.email}, Role: ${u.role}`)
      })
      return
    }
    
    console.log('📋 User found:')
    console.log('ID:', user._id)
    console.log('Email:', user.email)
    console.log('Current Role:', user.role)
    
    if (user.role === userModel.USER_ROLES.ADMIN) {
      console.log('✅ User is already admin!')
      return
    }
    
    // Update role thành admin
    const updateResult = await userModel.update(user._id.toString(), {
      role: userModel.USER_ROLES.ADMIN
    })
    
    console.log('✅ User updated to admin successfully!')
    console.log('New role:', updateResult.role)
    
  } catch (error) {
    console.error('❌ Error updating user to admin:', error)
  } finally {
    process.exit(0)
  }
}

// Lấy email từ command line argument
const email = process.argv[2]
if (!email) {
  console.log('❌ Please provide an email address')
  console.log('Usage: node update-user-to-admin.js <email>')
  console.log('Example: node update-user-to-admin.js user@example.com')
  process.exit(1)
}

updateUserToAdmin(email) 