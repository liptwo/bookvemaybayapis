/* eslint-disable no-useless-catch */
import { bookingModel } from '~/models/bookingModel'
import { flightModel } from '~/models/flightModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
// user,
const createNew = async ( reqBody) => {
  try {
    const { flightId, userId, passengerName, passengerEmail, seatNumber } = reqBody

    // 1. Kiểm tra chuyến bay có tồn tại và còn chỗ không
    const flight = await flightModel.findOneById(flightId)
    if (!flight) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Flight not found!')
    }
    if (flight.availableSeats <= 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Flight is full, no available seats!'
      )
    }

    // 2. Tạo booking
    const newBookingData = {
      userId, // Lấy từ thông tin user đã được xác thực
      flightId,
      passengerName,
      passengerEmail,
      seatNumber
    }
    const createdBooking = await bookingModel.createNew(newBookingData)
    const getNewBooking = await bookingModel.findOneById(
      createdBooking.insertedId
    )

    // 3. Cập nhật (giảm) số ghế trống của chuyến bay
    // Trong ứng dụng thực tế, bước 2 và 3 nên được thực hiện trong một transaction
    // để đảm bảo tính toàn vẹn dữ liệu (hoặc cả hai thành công, hoặc cả hai thất bại).
    await flightModel.update(flightId, {
      availableSeats: flight.availableSeats - 1
    })

    return getNewBooking
  } catch (error) {
    throw error
  }
}

const getMyBookings = async (user) => {
  try {
    const bookings = await bookingModel.findByUserId(user._id)
    return bookings
  } catch (error) { throw error }
}

const getBookingById = async (bookingId) => {
  try {
    // const bookingId = reqBody.bookingId
    const bookings = await bookingModel.findOneById(bookingId)
    return bookings
  } catch (error) { throw error }
}



export const bookingService = {
  createNew,
  getBookingById,
  getMyBookings
}
