import { getIO } from '~/config/socket.js'

// Middleware để truyền io instance vào request
const socketMiddleware = (req, res, next) => {
  try {
    req.io = getIO()
    next()
  } catch (error) {
    next(error)
  }
}

export { socketMiddleware } 