import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { extractToken } from "../utils/TokenExtractor";
import { extractJwtPayload } from "./jwt/PayloadExtractor";
import { validateSignature } from "./jwt/SignatureValidator";
import { IUsersService } from "../services/users/IUsersService";
import { User } from "../actors/User";
import { UserExceptions } from "../services/users/UserExceptions";

export const authentificationFactory = (usersService: IUsersService) => 
async (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const token = extractToken(request)
    if (!token) {
        reply.code(401).send(UserExceptions.NotAuthorized)
        return
    }

    // validating jwt signature
    const isValid = validateSignature(token)
    if (!isValid) {
        reply.code(401).send(UserExceptions.NotAuthorized)
        return
    }

    
    // extracting payload and validating
    const payload = extractJwtPayload(token)
    if (!payload) {
        reply.code(401).send(UserExceptions.NotAuthorized)
        return
    }

    // checking if token is actual
    try {
        const foundUser = await usersService.getUser("email", payload.email) as User
        if (foundUser.validToken !== token) {
            reply.code(401).send(UserExceptions.NotAuthorized)
            return
        }
        // throwing an error if user is not found or if service is unavailable 
    } catch (exception: unknown) {
        if ((exception as typeof UserExceptions.ServiceUnavailable).statusCode === 503) {
            reply.code(503).send(UserExceptions.ServiceUnavailable)
            return
        }
        reply.code(401).send(UserExceptions.NotAuthorized)
        return
    }
    
    done()
}
