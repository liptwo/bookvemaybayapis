import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    flightId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    // userId: Joi.string()
    //   .required()
    //   .pattern(OBJECT_ID_RULE)
    //   .message(OBJECT_ID_RULE_MESSAGE), // thêm tạm thời để test
    passengerName: Joi.string().required().trim().strict(),
    passengerEmail: Joi.string().email().required()
    // seatNumber: Joi.string().required().trim().strict()
  })

  try {
    // userId sẽ được lấy từ token (req.user) nên không cần validate trong body
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}


const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    flightId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    // userId: Joi.string()
    //   .required()
    //   .pattern(OBJECT_ID_RULE)
    //   .message(OBJECT_ID_RULE_MESSAGE), // thêm tạm thời để test
    passengerName: Joi.string().required().trim().strict(),
    passengerEmail: Joi.string().email().required()
    // seatNumber: Joi.string().required().trim().strict()
  })

  try {
    // userId sẽ được lấy từ token (req.user) nên không cần validate trong body
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}


export const bookingValidation = {
  createNew,
  update
}
