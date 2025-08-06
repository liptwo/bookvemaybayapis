import { StatusCodes } from 'http-status-codes'
import { chatService } from '~/services/chatService'
import { getIO } from '~/config/socket.js'
import { conversationModel } from '~/models/conversationModel'

const startConversation = async (req, res, next) => {
  try {
    // Lấy io instance trực tiếp từ config
    const result = await chatService.startConversation(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const getConversationHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.params
    const result = await chatService.getConversationHistory(conversationId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

// Dành cho admin để xem danh sách các cuộc trò chuyện đang mở
const getOpenConversations = async (req, res, next) => {
  try {
    const result = await chatService.getOpenConversations()
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

// Dành cho admin để gửi tin nhắn qua REST API
const postMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params
    const { content } = req.body
    const { userId } = req.jwtDecoded

    const messageData = {
      conversationId,
      senderId: userId,
      senderRole: 'admin',
      content
    }

    const result = await chatService.postMessage(messageData, req.io)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

// Dành cho admin để đóng cuộc trò chuyện
const closeConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params
    const result = await chatService.closeConversation(conversationId, req.io)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const chatController = {
  startConversation,
  getConversationHistory,
  getOpenConversations,
  postMessage,
  closeConversation
}
