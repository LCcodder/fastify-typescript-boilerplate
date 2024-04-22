import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { extractToken } from "../utils/TokenExtractor";
import { extractJwtPayload } from "./jwt/PayloadExtractor";
import { validateSignature } from "./jwt/SignatureValidator";
import { IUsersService } from "../services/users/IUsersService";
import { User } from "../actors/User";
import { USER_EXCEPTIONS } from "../services/users/UserExceptions";

export const authentificationFactory = (usersService: IUsersService) => 
async (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const token = extractToken(request)
    if (!token) {
        reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
        return
    }

    // validating jwt signature
    const isValid = validateSignature(token)
    if (!isValid) {
        reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
        return
    }

    
    // extracting payload and validating
    const payload = extractJwtPayload(token)
    if (!payload) {
        reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
        return
    }

    // checking if token is actual
    try {
        const foundUser = await usersService.getUser("login", payload.login) as User
        if (foundUser.validToken !== token) {
            reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
            return
        }
        // throwing an error if user is not found or if service is unavailable 
    } catch (exception: unknown) {
        if ((exception as typeof USER_EXCEPTIONS.ServiceUnavailable).statusCode === 503) {
            reply.code(503).send(USER_EXCEPTIONS.ServiceUnavailable)
            return
        }
        reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
        return
    }
    
    done()
}
