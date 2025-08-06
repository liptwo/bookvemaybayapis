import express from 'express'
import { chatController } from '~/controllers/chatController'
import { chatValidation } from '~/validations/chatValidation'
import { authMiddleware } from '~/middlewares/authMiddlewares'
import { socketMiddleware } from '~/middlewares/socketMiddleware'

const Router = express.Router()

// Endpoint cho client bắt đầu một cuộc trò chuyện mới
Router.route('/start')
  .post(chatValidation.startConversation, chatController.startConversation)

// Endpoint chỉ dành cho admin để xem tất cả các cuộc trò chuyện đang chờ/hoạt động
Router.route('/open')
  .get(authMiddleware.isAuthorized, authMiddleware.isAdmin, chatController.getOpenConversations)

// Endpoint cho cả client và admin đã xác thực để lấy lịch sử tin nhắn
Router.route('/:conversationId/history')
  .get(authMiddleware.isAuthorized, chatController.getConversationHistory)

// Endpoint để gửi tin nhắn qua REST API (cho admin)
Router.route('/:conversationId/message')
  .post(socketMiddleware, authMiddleware.isAuthorized, authMiddleware.isAdmin, chatValidation.postMessage, chatController.postMessage)

// Endpoint để đóng cuộc trò chuyện (chỉ admin)
Router.route('/:conversationId/close')
  .put(authMiddleware.isAuthorized, authMiddleware.isAdmin, chatController.closeConversation)

export const chatRoute = Router
