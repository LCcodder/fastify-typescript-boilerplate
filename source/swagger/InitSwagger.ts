import { FastifyInstance } from "fastify"
const swagger = require('@fastify/swagger')
const swaggerUI = require('@fastify/swagger-ui')

export const initSwagger = async (server: FastifyInstance): Promise<void> => {
    await server.register(swagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'NodeNotes',
                description: 'NodeNotes backend spec',
                version: '0.1.0'
            },
            servers: [
                {
                    url: 'http://localhost:8080',
                    description: 'Development server'
                }
            ],
            tags: [
                { name: 'users', description: 'User related end-points' },
                { name: 'notes', description: 'Note related end-points' }
            ]
        }
    })
    
    await server.register(swaggerUI, {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false
        },
        staticCSP: true,
        transformStaticCSP: (header: any) => header,
        transformSpecification: (swaggerObject: any, _request: any, _reply: any) => { return swaggerObject },
        transformSpecificationClone: true
    })
}