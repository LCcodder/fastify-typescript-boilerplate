import { FastifyInstance } from "fastify"
const swagger = require('@fastify/swagger')
const swaggerUI = require('@fastify/swagger-ui')

export const initSwaggerViewer = async (server: FastifyInstance): Promise<void> => {
    await server.register(swagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'NodeNotes (api - v1)',
                description: 'NodeNotes backend REST API endpoints specification',
                version: '1.0.0'
            },
            servers: [
                {
                    url: 'http://localhost:8080',
                    description: 'Development server'
                }
            ],
            tags: [
                { name: 'users', description: 'User related end-points (may require JWT in "Bearer" auth header)' },
                { name: 'auth', description: 'Authorization end-points (may require JWT in "Bearer" auth header)' },
                { name: 'notes', description: 'Note related end-points (requires JWT in "Bearer" auth header)' }
            ],
            externalDocs: {
                url: 'https://github.com/LCcodder/NodeNotes',
                description: 'GitHub repo'
            }
        }
    })
    
    await server.register(swaggerUI, {
        routePrefix: '/documentation',
        uiConfig: {
            deepLinking: false
        },
        staticCSP: true,
        transformStaticCSP: (header: any) => header,
        transformSpecification: (swaggerObject: any, _request: any, _reply: any) => { return swaggerObject },
        transformSpecificationClone: true
    })
}