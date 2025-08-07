import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
}

const BOOKING_COLLECTION_NAME = 'bookings'
const BOOKING_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  flightId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  passengerName: Joi.string().required().trim().strict(),
  passengerEmail: Joi.string().email().required(),
  seatNumber: Joi.string().trim().strict().default(''), // E.g., "A23", "B15"

  status: Joi.string()
    .valid(...Object.values(BOOKING_STATUS))
    .default(BOOKING_STATUS.CONFIRMED),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const INVALID_UPDATE_FIELDS = ['userId', 'flightId', 'passengerName', 'passengerEmail']
const createNew = async (data) => {
  try {
    const validData = await BOOKING_COLLECTION_SCHEMA.validateAsync(data, {
      abortEarly: false
    })
    // Chuẩn hóa userId và flightId thành ObjectId
    const dataToInsert = {
      ...validData,
      userId: new ObjectId(validData.userId),
      flightId: new ObjectId(validData.flightId)
    }
    return await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .insertOne(dataToInsert)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (bookingId) => {
  try {
    return await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(bookingId)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const findByUserId = async (userId) => {
  try {
    // Dùng toArray để lấy về một danh sách
    const result = await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .find({
        userId: new ObjectId(userId)
      })
      .toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (bookingId, reqBody) => {
  try {
    // Object.keys(reqBody).forEach((fieldName) => {
    //   if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
    //     delete reqBody[fieldName]
    //   }
    // })
    // console.log('rb ', reqBody)
    // console.log('bkid' ,bookingId)

    const result = await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(bookingId) },
        { $set: reqBody },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const bookingModel = {
  BOOKING_COLLECTION_NAME,
  BOOKING_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findByUserId,
  update
}
