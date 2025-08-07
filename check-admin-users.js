import { GET_DB } from './src/config/mongodb.js'
import { userModel } from './src/models/userModel.js'

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users in database...\n')
    
    // Lấy tất cả users
    const allUsers = await GET_DB().collection(userModel.USER_COLLECTION_NAME).find({}).toArray()
    console.log(`📊 Total users in database: ${allUsers.length}`)
    
    // Lọc admin users
    const adminUsers = allUsers.filter(user => user.role === userModel.USER_ROLES.ADMIN)
    console.log(`👑 Admin users: ${adminUsers.length}`)
    
    if (adminUsers.length > 0) {
      console.log('\n📋 Admin users details:')
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user._id}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Display Name: ${user.displayName}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Created: ${user.createdAt}`)
        console.log('')
      })
    } else {
      console.log('\n❌ No admin users found!')
      console.log('You need to create an admin user or update an existing user to admin role.')
    }
    
    // Hiển thị tất cả users
    console.log('\n📋 All users:')
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Display Name: ${user.displayName}`)
      console.log(`   Role: ${user.role}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error)
  } finally {
    process.exit(0)
  }
}

checkAdminUsers() 