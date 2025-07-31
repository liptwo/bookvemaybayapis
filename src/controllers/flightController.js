import { StatusCodes } from 'http-status-codes'
import { flightService } from '~/services/flightService'

const createNew = async (req, res, next) => {
  try {
    const createdFlight = await flightService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdFlight)
  } catch (error) { next(error) }
}

const find = async (req, res, next) => {
  try {
    // Dữ liệu tìm kiếm đến từ req.query
    console.log(req.query)
    // const flights = await flightService.find()
    // res.status(StatusCodes.OK).json(flights)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const flight = await flightService.getDetails(req.params.id)
    res.status(StatusCodes.OK).json(flight)
  } catch (error) { next(error) }
}

export const flightController = {
  createNew,
  find,
  getDetails
}