import { StatusCodes } from 'http-status-codes'
import { bookingService } from '~/services/bookingService'

const createNew = async (req, res, next) => {
  try {
    // req.user sẽ được gán bởi một middleware xác thực (ví dụ: isAuthorized)
    // const user = req.user user,
    const createdBooking = await bookingService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdBooking)
  } catch (error) { next(error) }
}

const getMyBookings = async (req, res, next) => {
  try {
    const user = req.user
    const bookings = await bookingService.getMyBookings(user)
    res.status(StatusCodes.OK).json(bookings)
  } catch (error) { next(error) }
}
const getBookingById = async (req, res, next) => {
  try {
    const bookingId = req.params
    const bookings = await bookingService.getBookingById(bookingId)
    res.status(StatusCodes.OK).json(bookings)
  } catch (error) { next(error) }
}

export const bookingController = {
  createNew,
  getBookingById,
  getMyBookings
}