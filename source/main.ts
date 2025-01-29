import fastify from 'fastify'
import { CONFIG } from './api/v1/shared/config/ServerConfiguration'
import { UsersService } from './api/v1/services/users/UsersService'
import { AuthService } from './api/v1/services/auth/AuthService'
import { logRequestMetadata } from './api/v1/api/hooks/onRequestLogger'
import { logResponseMetadata } from './api/v1/api/hooks/onResponseLogger'
import { authorizationPreHandlerFactory } from './api/v1/api/prehandlers/AuthPreHandler'
import { NotesService } from './api/v1/services/notes/NotesService'
import "reflect-metadata"
import { User as UserEntity } from './api/v1/database/entities/User'
import { DataSourceInitialiser } from './api/v1/database/InitDataSource'
import { Note as NoteEntity } from './api/v1/database/entities/Note'
import { initSwaggerViewer } from './api/v1/api/openapi/swagger/InitSwagger'
import { connectAndGetRedisInstance } from './api/v1/cache/InitRedisInstance'
import Healthcheck from './api/v1/shared/utils/common/Healthcheck'
import { CommonHandlers } from './api/v1/api/handlers/common/CommonHandlers'
import { AuthHandlers } from './api/v1/api/handlers/auth/AuthHandlers'
import { NotesHandlers } from './api/v1/api/handlers/notes/NotesHandlers'
import { UsersHandlers } from './api/v1/api/handlers/users/UsersHandlers'
import { LOGGER } from './api/v1/shared/utils/common/Logger'

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
    
    const appDataSource = await new DataSourceInitialiser(
        CONFIG.databaseHost,
        CONFIG.databasePort,
        CONFIG.databaseUser,
        CONFIG.databasePassword,
        CONFIG.databaseName
    ).initAndGetDataSource()

    const redis = await connectAndGetRedisInstance(
        CONFIG.redisConnectionString
    )

    // services DI
    const usersService = new UsersService(
        appDataSource.getRepository(UserEntity)
    )
    const authService = new AuthService(usersService, redis)
    const authentication = authorizationPreHandlerFactory(authService)
    const notesService = new NotesService(appDataSource.getRepository(NoteEntity), usersService)
    const healthcheck = new Healthcheck(redis, appDataSource)
    
    // registering handlers with version prefix
    server.register((server, _, done) => {
        const usersHandler = new UsersHandlers(server, authentication, usersService)
        const notesHandler = new NotesHandlers(server, authentication, notesService)
        const authHandler = new AuthHandlers(server, authentication, authService)
        const commonHandler = new CommonHandlers(server, healthcheck)

        usersHandler.handleRoutes()
        notesHandler.handleRoutes()
        authHandler.handleRoutes()
        commonHandler.handleRoutes()
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
            LOGGER.error(error)
            process.exit(1)
        }
    
        LOGGER.info(`Listening at address ${address}\n`)
    })
    
}
main()