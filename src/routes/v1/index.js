import express from 'express'
const Router = express.Router()
import { StatusCodes } from 'http-status-codes'
import { userRoute } from './userRoute'


Router.get('/', (req, res) => {
  res.send('<h2>Hello APIv1</h2>')
})

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'ok',
    message: 'Book ve may bay backend service is running'
  })
})

/** User APIs */
Router.use('/users', userRoute)

export const APIs_V1 = Router
