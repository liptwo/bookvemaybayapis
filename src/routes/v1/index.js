import express from 'express'
const Router = express.Router()
import { StatusCodes } from 'http-status-codes'
import { userRoute } from './userRoute'
import { flightRoute } from './flightRoute'
import { bookingRoute } from './bookingRoute'
import { chatRoute } from './chatRoute'
// import { bookingSeatRoute } from './bookingSeatRoute'


Router.get('/', (req, res) => {
  res.send('<h2>Hello APIv1</h2>')
})

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'ok',
    message: 'Book ve may bay backend service is running'
  })
})

/** User APIs */
Router.use('/users', userRoute)

/** Flight APIs */
Router.use('/flights', flightRoute)

/** Booking APIs */
Router.use('/bookings', bookingRoute)

// Booking Seat API //
// Router.use('/bookingseat', bookingSeatRoute)

/** Chat API */
Router.use('/chat', chatRoute)
export const APIs_V1 = Router
