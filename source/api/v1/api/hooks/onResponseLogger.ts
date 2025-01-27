import { FastifyReply, FastifyRequest } from "fastify"

export const logResponseMetadata = (_request: FastifyRequest, reply: FastifyReply, done: any): void => {
    console.log(`[RESPONSE] With status: ${reply.statusCode}\n`)
    done()
}