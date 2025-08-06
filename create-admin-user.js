import { GET_DB } from './src/config/mongodb.js'
import { userModel } from './src/models/userModel.js'
import bcrypt from 'bcrypt'

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...\n')

    // Thông tin admin user
    const adminData = {
      email: 'admin@example.com',
      password: 'admin123', // Sẽ được hash
      username: 'admin',
      displayName: 'Administrator',
      role: userModel.USER_ROLES.ADMIN,
      avatar: null,
      isActive: true
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await userModel.findOneByEmail(adminData.email)
    if (existingUser) {
      console.log('⚠️  Admin user already exists with email:', adminData.email)
      console.log('User ID:', existingUser._id)
      console.log('Role:', existingUser.role)
      return
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds)

    // Tạo user data với password đã hash
    const userData = {
      ...adminData,
      password: hashedPassword
    }

    // Tạo user mới
    const result = await userModel.createNew(userData)

    console.log('✅ Admin user created successfully!')
    console.log('User ID:', result.insertedId)
    console.log('Email:', adminData.email)
    console.log('Password:', adminData.password)
    console.log('Role:', adminData.role)
    console.log('\n📝 Login credentials:')
    console.log('Email: admin@example.com')
    console.log('Password: admin123')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    process.exit(0)
  }
}

createAdminUser()
