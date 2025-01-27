import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { IAuthService } from "../../services/auth/AuthServiceInterface";
import { extractToken } from "../../shared/utils/common/TokenExtractor";
import { validateSignature } from "../../shared/utils/jwt/SignatureValidator";
import { extractJwtPayload } from "../../shared/utils/jwt/PayloadExtractor";
import { isException } from "../../shared/utils/guards/ExceptionGuard";
import { USER_NOT_AUTHORIZED } from "../../shared/exceptions/UserExceptions";


export type AuthorizationPreHandler = (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => void

export const authorizationPreHandlerFactory = (authService: IAuthService) => 
async (request: FastifyRequest, reply: FastifyReply, _done: HookHandlerDoneFunction): Promise<AuthorizationPreHandler> => {
    const token = extractToken(request)
    if (!token) {
        reply.code(401).send(USER_NOT_AUTHORIZED)
        return
    }

    const signatureIsValid = validateSignature(token)
    if (!signatureIsValid) {
        reply.code(401).send(USER_NOT_AUTHORIZED)
        return
    }
    
    const payload = extractJwtPayload(token)
    if (!payload) {
        reply.code(401).send(USER_NOT_AUTHORIZED)
        return
    }

    const relevanceState = await authService.checkTokenRelevance(payload.login, token)
    if (isException(relevanceState)) {
        reply.code(
            relevanceState.statusCode
        ).send(relevanceState)
        return
    }    
}
