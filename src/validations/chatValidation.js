import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const startConversation = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().trim().strict(),
    email: Joi.string().email().required()
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const postMessage = async (req, res, next) => {
  const correctCondition = Joi.object({
    content: Joi.string().required().trim().strict()
  })
  try {
    // Validate body và params
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    await Joi.object({
      conversationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    }).validateAsync(req.params)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const chatValidation = {
  startConversation,
  postMessage
}
