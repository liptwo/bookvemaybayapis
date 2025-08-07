import express from 'express'
import { bookingSeatController } from '~/controllers/bookingSeatController'
const Router = express.Router()
import { authMiddleware } from '~/middlewares/authMiddlewares'
import { bookingSeatValidation } from '~/validations/bookingValidation'

Router.route('/').post(
  authMiddleware.isAuthorized,
  bookingSeatValidation.createNew,
  bookingSeatController.createBookingSeatInvitation
)

Router.route('/:bookingSeatId').put(
  authMiddleware.isAuthorized,
  bookingSeatController.updateBookingSeat
)

// get inviations by user
Router.route('/').get( authMiddleware.isAuthorized, bookingSeatController.getBookingSeat)

export const bookingSeatRoute = Router
