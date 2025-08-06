import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const CONVERSATION_STATUS = {
  PENDING: 'pending', // Đang chờ admin trả lời
  ACTIVE: 'active',   // Đang trong cuộc trò chuyện
  CLOSED: 'closed'    // Đã kết thúc
}

const CONVERSATION_COLLECTION_NAME = 'conversations'
const CONVERSATION_COLLECTION_SCHEMA = Joi.object({
  // Thông tin của client (khách truy cập)
  clientInfo: Joi.object({
    name: Joi.string().required().trim().strict(),
    email: Joi.string().email().required()
  }).required(),

  // ID của admin tham gia cuộc trò chuyện, có thể null ban đầu
  adminId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),

  status: Joi.string().valid(...Object.values(CONVERSATION_STATUS)).default(CONVERSATION_STATUS.PENDING),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await CONVERSATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    return await GET_DB().collection(CONVERSATION_COLLECTION_NAME).insertOne(validData)
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(CONVERSATION_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
  } catch (error) { throw new Error(error) }
}

const getOpenConversations = async () => {
  try {
    // Lấy các cuộc trò chuyện đang chờ hoặc đang hoạt động
    return await GET_DB().collection(CONVERSATION_COLLECTION_NAME).find({
      status: { $in: [CONVERSATION_STATUS.PENDING, CONVERSATION_STATUS.ACTIVE] }
    }).toArray()
  } catch (error) { throw new Error(error) }
}

const update = async (conversationId, updateData) => {
  try {
    // Lọc các trường không cho phép cập nhật
    Object.keys(updateData).forEach(fieldName => {
      if (['_id', 'clientInfo', 'createdAt'].includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    // Luôn cập nhật updatedAt
    updateData.updatedAt = Date.now()

    const result = await GET_DB().collection(CONVERSATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(conversationId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}


export const conversationModel = {
  CONVERSATION_COLLECTION_NAME,
  CONVERSATION_COLLECTION_SCHEMA,
  CONVERSATION_STATUS,
  createNew,
  findOneById,
  getOpenConversations,
  update
}
