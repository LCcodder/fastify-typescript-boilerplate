import { FastifyInstance } from "fastify";
import { IAuthService } from "../services/interfaces/AuthServiceInterface";
import { UserCredentials } from "../database/entities/User";
import { AUTH_EXCEPTIONS } from "../shared/exceptions/AuthExceptions";
import { AuthUserSchema, ChangePasswordSchema } from "../validation/schemas/AuthSchemas";
import { extractJwtPayload } from "../auth/jwt/PayloadExtractor";
import { extractToken } from "../shared/utils/common/TokenExtractor";
import { isException } from "../shared/utils/guards/ExceptionGuard";
import { USER_EXCEPTIONS } from "../shared/exceptions/UserExceptions";
import { Handler } from "./Handler";
import { AuthentificationPreHandler } from "../auth/AuthPreHandler";

export class AuthHandler extends Handler<IAuthService> {
    constructor(
        server: FastifyInstance, 
        authentificationPreHandler: AuthentificationPreHandler,
        authService: IAuthService
    ) {
        super(server, authentificationPreHandler, authService)
    }

    public override handleRoutes(): void {
        this.server.post<{
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
            
            const result = await this.service.authorizeAndGenerateToken(
                credentials.email, 
                credentials.password
            )
            if (isException(result)) {
                reply.code(result.statusCode).send(result)
                return
            }
    
            reply.code(200).send(result)
        
        })
    
        this.server.patch<{
            Body: { oldPassword: string, newPassword: string },
            Reply: {
                200: { success: true },
                400: typeof AUTH_EXCEPTIONS.WrongCredentials | typeof AUTH_EXCEPTIONS.NewPasswordIsSame,
                503: typeof AUTH_EXCEPTIONS.ServiceUnavailable | typeof USER_EXCEPTIONS.ServiceUnavailable
            }
        }>("/auth/password", {
            schema: ChangePasswordSchema,
            preHandler: this.authentificationPreHandler
        }, async (request, reply) => {
            const passwords = request.body
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const state = await this.service.changePassword(
                login,
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
}
