/* eslint-disable no-useless-catch */
import { conversationModel } from '~/models/conversationModel'
import { messageModel } from '~/models/messageModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { getIO } from '~/config/socket'

// Tạo cuộc trò chuyện mới
const startConversation = async (clientData) => {
  try {
    const conversation = await conversationModel.createNew({ clientInfo: clientData })
    const fullConversation = await conversationModel.findOneById(conversation.insertedId)

    // Thông báo cho admin có cuộc trò chuyện mới
    const io = getIO()
    io.to('admin_room').emit('new-conversation', fullConversation)

    return fullConversation
  } catch (error) { throw error }
}

// Lấy danh sách cuộc trò chuyện đang mở
const getOpenConversations = async () => {
  try {
    return await conversationModel.getOpenConversations()
  } catch (error) { throw error }
}

// Lấy lịch sử tin nhắn
const getConversationHistory = async (conversationId) => {
  try {
    // const conversation = await conversationModel.update(conversationId, { status: 'active' })
    const conversation = await conversationModel.findOneById(conversationId)
    if (!conversation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found')
    }
    const messages = await messageModel.findByConversationId(conversationId)
    return { conversation, messages }
  } catch (error) { throw error }
}

// Gửi tin nhắn
const postMessage = async (messageData) => {
  try {
    const { conversationId, senderId, senderRole, content } = messageData
    const newMessage = await messageModel.createNew({ conversationId, senderId, senderRole, content })
    // Gửi tin nhắn đến tất cả trong phòng chat
    const io = getIO()
    io.to(conversationId).emit('new-message', newMessage)

    return newMessage
  } catch (error) { throw error }
}

export const chatService = {
  startConversation,
  getOpenConversations,
  getConversationHistory,
  postMessage
}

