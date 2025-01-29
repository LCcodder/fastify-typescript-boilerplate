import { FastifyInstance } from "fastify";
import { IAuthService } from "../../../services/auth/AuthServiceInterface";
import { UserCredentials } from "../../../shared/dto/UserDto";
import { AuthUserSchema, ChangePasswordSchema } from "../../validation/schemas/AuthSchemas";
import { extractJwtPayload } from "../../../shared/utils/jwt/PayloadExtractor"; 
import { extractToken } from "../../../shared/utils/common/TokenExtractor";
import { isException } from "../../../shared/utils/guards/ExceptionGuard";
import { IHandlers } from "../Handler";
import { AuthorizationPreHandler } from "../../prehandlers/AuthPreHandler";

export class AuthHandlers implements IHandlers {
    constructor(
        private server: FastifyInstance, 
        private authorizationPreHandler: AuthorizationPreHandler,
        private authService: IAuthService
    ) {}

    public handleRoutes(): void {
        this.server.post<{
            Body: UserCredentials,
        }>("/auth", {
            schema: AuthUserSchema
        }, async (request, reply) => {
            const credentials: UserCredentials = request.body
            
            const result = await this.authService.authenticateAndGenerateToken(
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
        }>("/auth/password", {
            schema: ChangePasswordSchema,
            preHandler: this.authorizationPreHandler
        }, async (request, reply) => {
            const passwords = request.body
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const state = await this.authService.changePassword(
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
