import express from 'express'
const Router = express.Router()
import { notiController } from '~/controllers/notiController.js'


Router.route('/').post(notiController.createNew)
Router.route('/').get(notiController.find)
Router.route('/:id').get(notiController.getDetails)
export const notiRoute = Router

//