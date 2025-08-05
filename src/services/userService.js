/* eslint-disable no-useless-catch */

import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
// import { v4 as uuidv4 } from 'uuid'
import { ENV } from '~/config/environment'
import { userModel } from '~/models/userModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'
// import { htmlContent, WEBSITE_DOMAIN } from '~/utils/constants'
import { pickUser } from '~/utils/fomartter'


const createNew = async ( reqBody ) => {
  try {

    // kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) { throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')}
    // tạo data để lưu vào database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // tham số thứ 2 là độ phức tạp,  giá trị càng cao băm càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail // tên hiển thị về sau sẽ có thể thay đổi
    }
    // lưu vào database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // return
    return pickUser(getNewUser)
  } catch (error) { throw error }
}


const login = async (reqBody) => {
  try {
    // Query user trong database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if ( !existUser ) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or Password is incorrect!')
    if ( !existUser.isActive ) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account isn\'t active!')
    if ( !bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or Password is incorrect!')
    }
    // jsonwebtoken
    // Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE
    // Tạo thông tin sẽ đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }
    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
    const accessToken = await JwtProvider.generationToken(
      userInfo,
      ENV.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // 5 giây
      ENV.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generationToken(
      userInfo,
      ENV.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 15
      ENV.REFRESH_TOKEN_LIFE
    )

    // Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify / giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken,
      ENV.REFRESH_TOKEN_SECRET_SIGNATURE)

    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể
    // lấy luôn từ decoded ra, tiết kiệm query vào DB đề lấy data mới.
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }
    // Tạo accessTokeg mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ENV.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // 5 giây để test accessToken hết hạn
      ENV.ACCESS_TOKEN_LIFE // 1 tiếng
    )
    return { accessToken }
  } catch (error) { throw error }
}

const update = async ( userId, reqBody, userAvataFile ) => {
  try {
    const existUser = await userModel.findOneById(userId)
    // console.log('🚀 ~', existUser.updatedUser.value)
    if ( !existUser ) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    if ( !existUser.isActive ) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account isn\'t active!')
    // console.log('🚀 ~ userService.js:139 ~ update ~ existUser.password:', existUser)
    let updatedUser = {}
    // Kiểm tra trường hợp thay đổi mật khẩu
    if ( reqBody.new_password && reqBody.current_password ) {
      // Kiểm tra mật khẩu hiện tại có đúng không
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Current password is incorrect!')
      }
      // Nếu đúng thì băm mật khẩu mới và cập nhật vào database
      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })

    } else if ( userAvataFile ) {
      // trường hợp avatar xử lý upload ảnh lên cloundinary
      const uploadResult = await CloudinaryProvider.streamUpload(userAvataFile.buffer, 'users-trello')
      console.log(uploadResult)

      // lưu url của file ảnh vào database
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })
    } else {
      // Nếu không có trường hợp đổi mật khẩu thì không cần băm
      // console.log('🚀 ~ userService.js:151 ~ update ~ reqBody:', existUser._id)
      updatedUser = await userModel.update(existUser._id, reqBody )
      // console.log('🚀 ~ userService.js:88 ~ update ~ updatedUser:', updatedUser)
    }
    // console.log(updatedUser)
    console.log(updatedUser)
    return pickUser(updatedUser)
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  login,
  refreshToken,
  update
}