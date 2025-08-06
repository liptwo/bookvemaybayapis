import { StatusCodes } from 'http-status-codes'
import { notiService } from '~/services/notiService'

const createNew = async (req, res, next) => {
  try {
    const createdNoti = await notiService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdNoti)
  } catch (error) { next(error) }
}

const find = async (req, res, next) => {
  try {
    // Dữ liệu tìm kiếm đến từ req.query
    console.log(req.query)
    const notis = await notiService.find(req.query)
    res.status(StatusCodes.OK).json(notis)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const noti = await notiService.getDetails(req.params.id)
    res.status(StatusCodes.OK).json(noti)
  } catch (error) { next(error) }
}

export const notiController = {
  createNew,
  find,
  getDetails
}