import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const FLIGHT_COLLECTION_NAME = 'flights'
const FLIGHT_COLLECTION_SCHEMA = Joi.object({
  flightNumber: Joi.string().required().trim().strict(), // E.g., "VN240"
  airline: Joi.string().required().trim().strict(), // E.g., "Vietnam Airlines"

  departureAirport: Joi.string()
    .required()
    .length(3)
    .uppercase()
    .trim()
    .strict(), // E.g., "SGN"
  arrivalAirport: Joi.string().required().length(3).uppercase().trim().strict(), // E.g., "HAN"

  departureDateTime: Joi.date().timestamp('javascript').required(),
  arrivalDateTime: Joi.date().timestamp('javascript').required(),

  duration: Joi.number().integer().required(), // Duration in minutes
  price: Joi.number().required(),

  totalSeats: Joi.number().integer().required().min(1).default(180),
  availableSeats: Joi.number()
    .integer()
    .required()
    .default(Joi.ref('totalSeats')),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'flightNumber', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await FLIGHT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    return await GET_DB()
      .collection(FLIGHT_COLLECTION_NAME)
      .insertOne(validData)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (flightId) => {
  try {
    return await GET_DB()
      .collection(FLIGHT_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(flightId)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const find = async (query) => {
  try {
    return await GET_DB()
      .collection(FLIGHT_COLLECTION_NAME)
      .find(query)
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (flightId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB()
      .collection(FLIGHT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(flightId) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const flightModel = {
  FLIGHT_COLLECTION_NAME,
  FLIGHT_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  find,
  update
}
