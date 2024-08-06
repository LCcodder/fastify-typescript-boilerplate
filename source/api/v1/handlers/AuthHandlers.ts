import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { IAuthService } from "../services/auth/AuthServiceInterface";
import { UserCredentials, UserWithoutMetadata } from "../database/entities/User";
import { AUTH_EXCEPTIONS } from "../exceptions/AuthExceptions";
import { AuthUserSchema, ChangePasswordSchema } from "../validation/schemas/AuthSchemas";
import { extractJwtPayload } from "../auth/jwt/PayloadExtractor";
import { extractToken } from "../utils/TokenExtractor";
import { isException } from "../utils/guards/ExceptionGuard";
import { USER_EXCEPTIONS } from "../exceptions/UserExceptions";

export const handleAuthRoutes = (
    server: FastifyInstance, 
    authService: IAuthService,
    authenticate: (
        request: FastifyRequest, 
        reply: FastifyReply, 
        done: HookHandlerDoneFunction
    ) => void    
) => {
    server.post<{
        Body: UserCredentials,
        Reply: {
            200: { token: string, expiresIn: string },
            400: typeof AUTH_EXCEPTIONS.WrongCredentials,
            503: typeof AUTH_EXCEPTIONS.ServiceUnavailable | typeof USER_EXCEPTIONS.ServiceUnavailable
        }
    }>("/auth", {
        schema: AuthUserSchema
    }, async (request, reply) => {
            const credentials: UserCredentials = request.body
            
            const result = await authService.authorizeAndGetToken(
                credentials.email, 
                credentials.password
            )
            if (isException(result)) {
                reply.code(result.statusCode).send(result)
                return
            }

            reply.code(200).send({
                token: result[0],
                expiresIn: result[1]
            })
        
    })

    server.patch<{
        Body: { oldPassword: string, newPassword: string },
        Reply: {
            200: { success: true },
            400: typeof AUTH_EXCEPTIONS.WrongCredentials | typeof AUTH_EXCEPTIONS.NewPasswordIsSame,
            503: typeof AUTH_EXCEPTIONS.ServiceUnavailable | typeof USER_EXCEPTIONS.ServiceUnavailable
        }
    }>("/auth/password", {
        schema: ChangePasswordSchema,
        preHandler: authenticate
    }, async (request, reply) => {
            const passwords = request.body
            const payload = extractJwtPayload(
                extractToken(request)
            )
            const state = await authService.changePassword(
                payload.login,
                passwords.oldPassword,
                passwords.newPassword
            )
            if (isException(state)) {
                reply.code(state.statusCode).send(state)
                return
            }
            
            reply.code(200).send(state)
        
    })
}