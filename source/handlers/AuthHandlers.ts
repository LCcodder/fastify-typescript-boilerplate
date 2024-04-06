import { FastifyInstance } from "fastify";
import { IAuthService } from "../services/auth/IAuthService";
import { UserCredentials, UserWithoutMetadata } from "../actors/User";
import { AuthExceptions } from "../services/auth/AuthExceptions";
import { AuthUserSchema } from "./schemas/AuthSchemas";

export const handleAuthRoutes = (server: FastifyInstance, authService: IAuthService) => {
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
            
            const [token, expiresIn] = await authService.authorizateAndGetToken(
                credentials.email, 
                credentials.password
            ) as [string, string]

            reply.code(200).send({
                token,
                expiresIn
            })
        } catch (exception: unknown) {
            reply.code(
                (exception as typeof AuthExceptions.WrongCredentials
                    | typeof AuthExceptions.ServiceUnavailable
                ).statusCode
            ).send(exception as any)
        }
    })
}