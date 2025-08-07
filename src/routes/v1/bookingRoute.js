import express from 'express'
const Router = express.Router()
import { bookingController } from '~/controllers/bookingController'
import { bookingValidation } from '~/validations/bookingValidation'
import { authMiddleware } from '~/middlewares/authMiddlewares'

Router.route('/')
  // Cần một middleware để xác thực người dùng trước khi cho phép đặt vé
  .post(authMiddleware.isAuthorized, bookingValidation.createNew, bookingController.createNew)

Router.route('/:id')
  .get(/*authMiddleware.isAuthorized,*/ bookingController.getBookingById)
  // .put(bookingValidation.update, bookingController.update)

Router.route('/my-bookings')
  // Cần middleware xác thực để lấy được req.user
  .get( /*authMiddleware.isAuthorized,*/ bookingController.getMyBookings)


export const bookingRoute = Router