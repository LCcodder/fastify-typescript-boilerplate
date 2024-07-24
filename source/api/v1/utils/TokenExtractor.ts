import { FastifyRequest } from "fastify";

export const extractToken = (request: FastifyRequest): string => {
    return request.headers.authorization?.split(" ").slice(1)[0]
}