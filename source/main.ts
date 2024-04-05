import fastify from 'fastify'
import loadConfig from './config/ServerConfiguration'
import { modelsFactory } from './database/ModelsFactory'
import mongoose from 'mongoose'
import { UsersService } from './services/users/UsersService'
import { handleUserRoutes } from './handlers/UsersHandlers'


const CONFIG = loadConfig()
const server = fastify({
  ignoreDuplicateSlashes: true,
  logger: {
    level: 'debug',
  }
})


mongoose.connect('mongodb://127.0.0.1:27017/NodeNotes')
const models = modelsFactory(mongoose)
const usersService = new UsersService(models.User)
handleUserRoutes(server, usersService)




server.listen({ 
  port: CONFIG.port
}, (err, address) => {})
