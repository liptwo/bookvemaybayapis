/* eslint-disable no-console */

import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'


const createNew = async (req, res, next) => {

  try {
    //Điều hướng dữ liệu sang tầng service
    const createdColumn = await userService.createNew(req.body)

    //Có kết quả thì trả về client
    res.status(StatusCodes.CREATED).json(createdColumn)
  } catch (error) { next(error) }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    /**
    * Xử lý trả về http only cookie cho phía trình duyệt
    * Về cái maxAge và thư viện ms: https://expressjs.com/en/api.html
    * Đối với cái maxAge - thời gian sống của Cookie thì chúng ta sẽ để tối đa 14 ngày, tùy dự án. Lưu ý
    thời gian sống của cookie khác với cái thời gian sống của token nhé. Đừng bị nhằm lần :D
    */
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const logout = async (req, res, next) => {
  try {
    // console.log('logout')
    res.clearCookie('accessToken')
    res.clearCookie('refeshToken')
    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('accessToken', result.accessToken, {httpOnly: true, secure: true, sameSite: 'none', maxAge:ms('14 days') })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In!'))}
}

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const userAvataFile = req.file
    // console.log('avatar', userAvataFile)
    const updateUser = await userService.update(userId, req.body, userAvataFile)
    // console.log('🚀 ~ userController.js:82 ~ update ~ updateUser:', updateUser)
    // res.cookie('accessToken', result.accessToken, {httpOnly: true, secure: true, sameSite: 'none', maxAge:ms('14 days') })
    res.status(StatusCodes.OK).json(updateUser)
  } catch (error) { next(error)}
}


export const userController = {
  createNew,
  login,
  logout,
  refreshToken,
  update
}