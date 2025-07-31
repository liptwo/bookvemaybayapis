/* eslint-disable no-useless-catch */
import { flightModel } from '~/models/flightModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    // Logic nghiệp vụ có thể thêm ở đây (ví dụ: kiểm tra flightNumber đã tồn tại chưa)
    const newFlight = {
      ...reqBody
    }
    const createdFlight = await flightModel.createNew(newFlight)
    const getNewFlight = await flightModel.findOneById(createdFlight.insertedId)
    return getNewFlight
  } catch (error) {
    throw error
  }
}

const find = async (queryParams) => {
  try {
    // Xử lý logic tìm kiếm
    const { departureAirport, arrivalAirport, departureDate } = queryParams

    // Tạo khoảng thời gian tìm kiếm trong ngày departureDate
    const startOfDay = new Date(departureDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(departureDate)
    endOfDay.setHours(23, 59, 59, 999)

    const query = {
      departureAirport,
      arrivalAirport,
      departureDateTime: {
        $gte: startOfDay.getTime(),
        $lt: endOfDay.getTime()
      },
      _destroy: false,
      availableSeats: { $gt: 0 } // Chỉ tìm chuyến bay còn chỗ
    }

    const flights = await flightModel.find(query)
    return flights
  } catch (error) {
    throw error
  }
}

const getDetails = async (flightId) => {
  try {
    const flight = await flightModel.findOneById(flightId)
    if (!flight) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Flight not found!')
    }
    return flight
  } catch (error) {
    throw error
  }
}

export const flightService = {
  createNew,
  find,
  getDetails
}
