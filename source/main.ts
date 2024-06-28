import fastify from 'fastify'
import { CONFIG } from './config/ServerConfiguration'
import { UsersService } from './services/users/UsersService'
import { handleUserRoutes } from './handlers/UsersHandlers'
import { AuthService } from './services/auth/AuthService'
import { handleAuthRoutes } from './handlers/AuthHandlers'
import { logRequestMetadata } from './hooks/onRequestLogger'
import { logResponseMetadata } from './hooks/onResponseLogger'
import { authentificationFactory } from './auth/AuthPreHandler'
import { handleNoteRoutes } from './handlers/NotesHandlers'
import { NotesService } from './services/notes/NotesService'
import "reflect-metadata"
import {User} from './database/entities/_User'
import { initAndGetDataSource } from './database/InitDataSource'
import { Note } from './database/entities/_Note'

CONFIG.log()

const server = fastify({
    ignoreDuplicateSlashes: true,
    logger: {
        level: 'error',
    }
})

server.addHook('onRequest', logRequestMetadata)
server.addHook('onResponse', logResponseMetadata)

const appDataSource = initAndGetDataSource(
    "localhost",
    5432,
    "postgres",
    "pwd",
    "NodeNotes"
)

const usersService = new UsersService(
    appDataSource.getRepository(User)
)
const authentification = authentificationFactory(usersService)
const authService = new AuthService(usersService)
const notesService = new NotesService(appDataSource.getRepository(Note), usersService)

handleUserRoutes(server, usersService, authentification)
handleAuthRoutes(server, authService, authentification)
handleNoteRoutes(server, notesService, authentification)



server.listen({ 
    port: CONFIG.port
}, (error: Error, address: string) => {
    
    if (error) {
        console.log(error)
        process.exit(1)
    }

    console.log(`[INFO] Listening at address ${address}\n`)
})
