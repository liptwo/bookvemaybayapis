import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const MESSAGE_SENDER_ROLE = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

const MESSAGE_COLLECTION_NAME = 'messages'
const MESSAGE_COLLECTION_SCHEMA = Joi.object({
  conversationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  senderId: Joi.string().required(), // Có thể là client's temporary ID hoặc admin's ObjectId
  senderRole: Joi.string().valid(...Object.values(MESSAGE_SENDER_ROLE)).required(),
  content: Joi.string().required().trim().strict(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await MESSAGE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const db = GET_DB()
    // Chuyển đổi conversationId sang ObjectId để lưu trữ đúng cách
    const dataToInsert = {
      ...validData,
      conversationId: new ObjectId(validData.conversationId)
    }
    const result = await db.collection(MESSAGE_COLLECTION_NAME).insertOne(dataToInsert)
    // Lấy lại document vừa tạo để trả về đầy đủ thông tin
    return await db.collection(MESSAGE_COLLECTION_NAME).findOne({ _id: result.insertedId })
  } catch (error) { throw new Error(error) }
}

const findByConversationId = async (conversationId) => {
  try {
    return await GET_DB().collection(MESSAGE_COLLECTION_NAME).find({
      conversationId: new ObjectId(conversationId)
    }).sort({ createdAt: 1 }).toArray() // Sắp xếp tin nhắn theo thời gian
  } catch (error) { throw new Error(error) }
}

export const messageModel = {
  MESSAGE_COLLECTION_NAME,
  MESSAGE_COLLECTION_SCHEMA,
  MESSAGE_SENDER_ROLE,
  createNew,
  findByConversationId
}
