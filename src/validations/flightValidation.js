import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  // Dữ liệu cho việc tạo mới một chuyến bay không cần validate ở đây
  // vì nó thường được quản lý bởi admin.
  // Tuy nhiên, nếu bạn có một form cho admin, bạn nên thêm validation ở đây.
  next()
}

const find = async (req, res, next) => {
  const correctCondition = Joi.object({
    departureAirport: Joi.string().required().length(3).uppercase(),
    arrivalAirport: Joi.string().required().length(3).uppercase(),
    departureDate: Joi.date().iso().required()
  })

  try {
    // Validate req.query thay vì req.body cho việc tìm kiếm (GET)
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const flightValidation = {
  createNew,
  find
}