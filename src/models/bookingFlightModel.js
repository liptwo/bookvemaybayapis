import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Đã sửa lại tên collection cho chính xác
const BOOKING_NOTIFICATION_COLLECTION_NAME = 'bookingNotifications'

const BOOKING_NOTIFICATION_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  flightId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  bookingCode: Joi.string()
    .alphanum()
    .min(6)
    .max(12)
    .required()
    .trim()
    .strict(), // Ví dụ: "BK230915AB"

  message: Joi.string().required().trim().strict(), // Thông báo gửi về cho user

  sentAt: Joi.date().timestamp('javascript').default(Date.now),

  read: Joi.boolean().default(false), // Đánh dấu đã đọc hay chưa

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await BOOKING_NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    // Chuyển userId và flightId sang dạng ObjectId trước khi lưu
    const dataToInsert = {
      ...validData,
      userId: new ObjectId(validData.userId),
      flightId: new ObjectId(validData.flightId)
    }
    return await GET_DB()
      .collection(BOOKING_NOTIFICATION_COLLECTION_NAME)
      .insertOne(dataToInsert)
  } catch (error) {
    throw new Error(error)
  }
}

const findByUserId = async (userId) => {
  try {
    return await GET_DB()
      .collection(BOOKING_NOTIFICATION_COLLECTION_NAME)
      .find({
        userId: new ObjectId(userId),
        _destroy: false
      })
      .sort({ sentAt: -1 }) // Gần nhất lên đầu
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Hàm find mới được thêm vào
 * Tìm kiếm thông báo dựa trên một đối tượng query linh hoạt
 */
const find = async (query) => {
  try {
    return await GET_DB()
      .collection(BOOKING_NOTIFICATION_COLLECTION_NAME)
      .find(query)
      .sort({ sentAt: -1 }) // Sắp xếp thông báo mới nhất lên đầu
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

export const bookingNotificationModel = {
  BOOKING_NOTIFICATION_COLLECTION_NAME,
  BOOKING_NOTIFICATION_COLLECTION_SCHEMA,
  createNew,
  findByUserId,
  find // Thêm hàm find vào export
}
