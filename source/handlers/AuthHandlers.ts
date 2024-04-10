import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { IAuthService } from "../services/auth/IAuthService";
import { UserCredentials, UserWithoutMetadata } from "../actors/User";
import { AuthExceptions } from "../services/auth/AuthExceptions";
import { AuthUserSchema, ChangePasswordSchema } from "./validation/AuthSchemas";
import { extractJwtPayload } from "../auth/jwt/PayloadExtractor";
import { extractToken } from "../utils/TokenExtractor";

export const handleAuthRoutes = (
    server: FastifyInstance, 
    authService: IAuthService,
    authentificate: (
        request: FastifyRequest, 
        reply: FastifyReply, 
        done: HookHandlerDoneFunction
    ) => void    
) => {
    server.post<{
        Body: UserCredentials,
        Reply: {
            200: { token: string, expiresIn: string },
            400: typeof AuthExceptions.WrongCredentials,
            503: typeof AuthExceptions.ServiceUnavailable
        }
    }>("/auth", {schema: AuthUserSchema}, async (request, reply) => {
        try {
            const credentials: UserCredentials = request.body
            
            const [token, expiresIn] = await authService.authorizeAndGetToken(
                credentials.email, 
                credentials.password
            ) as [string, string]

            reply.code(200).send({
                token,
                expiresIn
            })
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })

    server.patch<{
        Body: { oldPassword: string, newPassword: string },
        Reply: {
            200: { success: true },
            400: typeof AuthExceptions.WrongCredentials,
            503: typeof AuthExceptions.ServiceUnavailable
        }
    }>("/auth/password", {
        schema: ChangePasswordSchema,
        preHandler: authentificate
    }, async (request, reply) => {
        try {
            const passwords = request.body
            const payload = extractJwtPayload(
                extractToken(request)
            )
            const state = await authService.changePassword(
                payload.login,
                passwords.oldPassword,
                passwords.newPassword
            ) as { success: true }
            
            reply.code(200).send(state)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })
}