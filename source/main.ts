import fastify from 'fastify'
import { CONFIG } from './api/v1/config/ServerConfiguration'
import { UsersService } from './api/v1/services/UsersService'
import { handleUserRoutes } from './api/v1/handlers/UsersHandlers'
import { AuthService } from './api/v1/services/AuthService'
import { handleAuthRoutes } from './api/v1/handlers/AuthHandlers'
import { logRequestMetadata } from './api/v1/hooks/onRequestLogger'
import { logResponseMetadata } from './api/v1/hooks/onResponseLogger'
import { authenticationFactory } from './api/v1/auth/AuthPreHandler'
import { handleNoteRoutes } from './api/v1/handlers/NotesHandlers'
import { NotesService } from './api/v1/services/NotesService'
import "reflect-metadata"
import { UserEntity } from './api/v1/database/entities/User'
import { initAndGetDataSource } from './api/v1/database/InitDataSource'
import { NoteEntity } from './api/v1/database/entities/Note'
import { initSwaggerViewer } from './openapi/InitSwagger'
import { connectAndGetRedisInstance } from './api/v1/cache/InitRedisInstance'



const main = async () => {
    CONFIG.log()

    const server = fastify({
        ignoreDuplicateSlashes: true,
        logger: {
            level: 'error',
        }
    })

    
    
    await initSwaggerViewer(server)
    
    server.addHook('onRequest', logRequestMetadata)
    server.addHook('onResponse', logResponseMetadata)
    
    const appDataSource = initAndGetDataSource(
        CONFIG.databaseHost,
        CONFIG.databasePort,
        CONFIG.databaseUser,
        CONFIG.databasePassword,
        CONFIG.databaseName
    )

    const redis = await connectAndGetRedisInstance(
        CONFIG.redisConnectionString
    )
    
    // services DI
    const usersService = new UsersService(
        appDataSource.getRepository(UserEntity.User)
    )
    const authService = new AuthService(usersService, redis)
    const authentication = authenticationFactory(authService)
    const notesService = new NotesService(appDataSource.getRepository(NoteEntity.Note), usersService)
    
    // versioning decorator which adds '/api/v' prefix to all routes
    server.register((server, _, done) => {
        handleUserRoutes(server, usersService, authentication)
        handleAuthRoutes(server, authService, authentication)
        handleNoteRoutes(server, notesService, authentication)

        done()
    }, { prefix: "/api/v1" })

    
    server.ready().then(_ => {
        (server as any).swagger() 
    })

    server.listen({
        port: CONFIG.appPort,
        host: '0.0.0.0'
    }, (error: Error, address: string) => {
        
        if (error) {
            console.log(error)
            process.exit(1)
        }
    
        console.log(`[INFO] Listening at address ${address}\n`)
    })
    
}
main()