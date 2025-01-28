import { FastifyReply, FastifyRequest } from "fastify"
import { LOGGER } from "../../shared/utils/common/Logger"

export const logResponseMetadata = (_request: FastifyRequest, reply: FastifyReply, done: any): void => {
    LOGGER.log('info', `[RESPONSE] With status: ${reply.statusCode}\n`)
    done()
}