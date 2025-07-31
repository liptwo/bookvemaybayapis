import { MongoClient, ServerApiVersion } from 'mongodb'
import { ENV } from './environment'

let clientDB
let DBInstance = null

export const connectToDatabase = async () => {
  if (!DBInstance) {
    clientDB = new MongoClient(ENV.MONGO_DB, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    await clientDB.connect()
    DBInstance = clientDB.db(ENV.DB_NAME)
  }
  return DBInstance
}

export const GET_DB = () => {
  if (!DBInstance) throw new Error('Must connect to Database first!')
  return DBInstance
}

export const EXIT_DB = async () => {
  console.log('Kết thúc.')
  await clientDB.close()
}