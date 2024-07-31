import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { extractToken } from "../utils/TokenExtractor";
import { extractJwtPayload } from "./jwt/PayloadExtractor";
import { validateSignature } from "./jwt/SignatureValidator";
import { USER_EXCEPTIONS } from "../exceptions/UserExceptions";
import { IAuthService } from "../services/auth/AuthServiceInterface";

export const authenticationFactory = (authService: IAuthService) => 
async (request: FastifyRequest, reply: FastifyReply, _done: HookHandlerDoneFunction) => {
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
        await authService.compareTokens(payload.login, token)
    } catch (exception: any) {
        reply.code(
            exception.statusCode
        ).send(exception)

        return
    }
    
}
