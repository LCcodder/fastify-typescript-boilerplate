import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { extractToken } from "../utils/TokenExtractor";
import { extractJwtPayload } from "./jwt/PayloadExtractor";
import { validateSignature } from "./jwt/SignatureValidator";
import { IUsersService } from "../services/users/UsersServiceInterface";
import { User } from "../database/entities/User";
import { USER_EXCEPTIONS } from "../exceptions/UserExceptions";
import { IAuthService } from "../services/auth/AuthServiceInterface";

export const authenticationFactory = (authService: IAuthService) => 
async (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const token = extractToken(request)
    if (!token) {

        reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
        return
    }

    // validating jwt signature
    const signatureIsValid = validateSignature(token)
    if (!signatureIsValid) {
        
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
        authService.compareTokens(payload.login, token)
        // const foundUser = await usersService.getUser("login", payload.login) as User
        // if (foundUser.validToken !== token) {
        //     reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
        //     return
        // }
        // throwing an error if user is not found or if service is unavailable 
    } catch (exception: any) {
        // if ((exception as typeof USER_EXCEPTIONS.ServiceUnavailable).statusCode === 503) {
        //     reply.code(503).send(USER_EXCEPTIONS.ServiceUnavailable)
        // } else {
        //     reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
        // }
        reply.code(
            exception.statusCode
        ).send(exception)

        return
    }
    
    done()
}
