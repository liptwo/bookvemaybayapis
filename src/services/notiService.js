/* eslint-disable no-useless-catch */
import { notiModel } from '~/models/notiModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    // Logic nghiệp vụ có thể thêm ở đây (ví dụ: kiểm tra flightNumber đã tồn tại chưa)
    const newFlight = {
      ...reqBody
    }
    const createdNoti = await notiModel.createNew(newFlight)
    const getNewNoti = await notiModel.findOneById(createdNoti.insertedId)
    return getNewNoti
  } catch (error) {
    throw error
  }
}

const find = async (queryParams) => {
  try {
    const { userId } = queryParams
    const query = {
      userId
    }
    // console.log('query nè', query)
    const flights = await notiModel.find(query)
    // console.log('flight nè', flights)
    return flights
  } catch (error) {
    throw error
  }
}

const getDetails = async (notiId) => {
  try {
    const noti = await notiModel.findOneById(notiId)
    if (!noti) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Noti not found!')
    }
    return noti
  } catch (error) {
    throw error
  }
}

export const notiService = {
  createNew,
  find,
  getDetails
}
