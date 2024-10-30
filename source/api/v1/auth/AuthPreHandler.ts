import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { extractToken } from "../utils/common/TokenExtractor";
import { extractJwtPayload } from "./jwt/PayloadExtractor";
import { validateSignature } from "./jwt/SignatureValidator";
import { USER_EXCEPTIONS } from "../exceptions/UserExceptions";
import { IAuthService } from "../services/interfaces/AuthServiceInterface";
import { isException } from "../utils/guards/ExceptionGuard";

export const authenticationFactory = (authService: IAuthService) => 
async (request: FastifyRequest, reply: FastifyReply, _done: HookHandlerDoneFunction) => {
    const token = extractToken(request)
    if (!token) {
        reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
        return
    }

    const signatureIsValid = validateSignature(token)
    if (!signatureIsValid) {
        reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
        return
    }
    
    const payload = extractJwtPayload(token)
    if (!payload) {
        reply.code(401).send(USER_EXCEPTIONS.NotAuthorized)
        return
    }

    // try {
    const relevanceState = await authService.checkTokenRelevance(payload.login, token)
    if (isException(relevanceState)) {
        reply.code(
            relevanceState.statusCode
        ).send(relevanceState)
        return
    }
    // } catch (exception: any) {
    //     reply.code(
    //         exception.statusCode
    //     ).send(exception)
    //     return
    // }
    
}
