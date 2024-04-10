import fastify from 'fastify'
import { CONFIG } from './config/ServerConfiguration'
import { modelsFactory } from './database/ModelsFactory'
import mongoose from 'mongoose'
import { UsersService } from './services/users/UsersService'
import { handleUserRoutes } from './handlers/UsersHandlers'
import { AuthService } from './services/auth/AuthService'
import { handleAuthRoutes } from './handlers/AuthHandlers'
import { logRequestMetadata } from './hooks/onRequestLogger'
import { logResponseMetadata } from './hooks/onResponseLogger'
import { authentificationFactory } from './auth/AuthPreHandler'


const server = fastify({
    ignoreDuplicateSlashes: true,
    logger: {
        level: 'error',
    }
})

server.addHook('onRequest', logRequestMetadata)
server.addHook('onResponse', logResponseMetadata)

mongoose.connect('mongodb://127.0.0.1:27017/NodeNotes').then(_ => {
    console.log(`[DATABASE] Connected at host , ready to use\n`)
})
const models = modelsFactory(mongoose)

const usersService = new UsersService(models.User)
const authentification = authentificationFactory(usersService)
const authService = new AuthService(usersService)

handleUserRoutes(server, usersService, authentification)
handleAuthRoutes(server, authService, authentification)




server.listen({ 
    port: CONFIG.port
}, (error: Error, address: string) => {
    
    if (error) {
        console.log(error)
        process.exit(1)
    }

    console.log(`[LISTENING] At address ${address}\n`)
})
