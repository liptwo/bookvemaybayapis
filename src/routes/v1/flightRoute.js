import express from 'express'
import { flightController } from '~/controllers/flightController'
import { flightValidation } from '~/validations/flightValidation'

const Router = express.Router()

// Endpoint để admin tạo chuyến bay mới
Router.route('/')
  .post(flightController.createNew)

// Endpoint để user tìm kiếm chuyến bay
Router.route('/search')
  .get(flightValidation.find, flightController.find)

// Endpoint để lấy chi tiết một chuyến bay
Router.route('/:id')
  .get(flightController.getDetails)

export const flightRoute = Router