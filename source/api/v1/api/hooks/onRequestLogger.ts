import { FastifyReply, FastifyRequest } from "fastify"

export const logRequestMetadata = (request: FastifyRequest, _reply: FastifyReply, done: any): void => {
    console.log(`[${request.method}] Request from ${request.ip} with route ${request.hostname}${request.url}`)
    done()
}