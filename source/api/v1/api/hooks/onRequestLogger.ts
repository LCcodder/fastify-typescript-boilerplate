import { FastifyReply, FastifyRequest } from "fastify"
import { LOGGER } from "../../shared/utils/common/Logger"

export const logRequestMetadata = (request: FastifyRequest, _reply: FastifyReply, done: any): void => {
    LOGGER.log('info', `[${request.method}] Request from ${request.ip} with route ${request.hostname}${request.url}`)
    done()
}