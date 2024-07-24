import fastify from 'fastify'
import { CONFIG } from './config/ServerConfiguration'
import { UsersService } from './api/v1/services/users/UsersService'
import { handleUserRoutes } from './api/v1/handlers/UsersHandlers'
import { AuthService } from './api/v1/services/auth/AuthService'
import { handleAuthRoutes } from './api/v1/handlers/AuthHandlers'
import { logRequestMetadata } from './api/v1/hooks/onRequestLogger'
import { logResponseMetadata } from './api/v1/hooks/onResponseLogger'
import { authentificationFactory } from './api/v1/auth/AuthPreHandler'
import { handleNoteRoutes } from './api/v1/handlers/NotesHandlers'
import { NotesService } from './api/v1/services/notes/NotesService'
import "reflect-metadata"
import { UserEntity, User } from './api/v1/database/entities/_User'
import { initAndGetDataSource } from './api/v1/database/InitDataSource'
import { NoteEntity, Note } from './api/v1/database/entities/_Note'
import { initSwagger } from './swagger/InitSwagger'


const main = async () => {
    CONFIG.log()

    const server = fastify({
        ignoreDuplicateSlashes: true,
        logger: {
            level: 'error',
        }
    })

    
    
    await initSwagger(server)
    
    // logging hooks
    server.addHook('onRequest', logRequestMetadata)
    server.addHook('onResponse', logResponseMetadata)
    
    const appDataSource = initAndGetDataSource(
        "localhost",
        5432,
        "postgres",
        "robocopid12",
        "NodeNotes"
    )
    
    // services DI
    const usersService = new UsersService(
        appDataSource.getRepository(UserEntity.User)
    )
    const authentification = authentificationFactory(usersService)
    const authService = new AuthService(usersService)
    const notesService = new NotesService(appDataSource.getRepository(NoteEntity.Note), usersService)
    
    // versioning decorator which adds '/api/v' prefix to all routes
    server.register((server, _, done) => {
        handleUserRoutes(server, usersService, authentification)
        handleAuthRoutes(server, authService, authentification)
        handleNoteRoutes(server, notesService, authentification)

        done()
    }, { prefix: "/api/v1" })

    
    server.ready().then(_ => {
        (server as any).swagger() 
    })

    server.listen({
        port: CONFIG.appPort
    }, (error: Error, address: string) => {
        
        if (error) {
            console.log(error)
            process.exit(1)
        }
    
        console.log(`[INFO] Listening at address ${address}\n`)
    })
    
}
main()