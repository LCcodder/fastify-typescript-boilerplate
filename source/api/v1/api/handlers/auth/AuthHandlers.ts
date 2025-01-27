import { FastifyInstance } from "fastify";
import { IAuthService } from "../../../services/auth/AuthServiceInterface";
import { UserCredentials } from "../../../shared/dto/UserDto";
import { AuthUserSchema, ChangePasswordSchema } from "../../validation/schemas/AuthSchemas";
import { extractJwtPayload } from "../../../shared/utils/jwt/PayloadExtractor"; 
import { extractToken } from "../../../shared/utils/common/TokenExtractor";
import { isException } from "../../../shared/utils/guards/ExceptionGuard";
import { Handler } from "../Handler";
import { AuthorizationPreHandler } from "../../prehandlers/AuthPreHandler";

export class AuthHandler extends Handler<IAuthService> {
    constructor(
        server: FastifyInstance, 
        authorizationPreHandler: AuthorizationPreHandler,
        authService: IAuthService
    ) {
        super(server, authorizationPreHandler, authService)
    }

    public override handleRoutes(): void {
        this.server.post<{
            Body: UserCredentials,
        }>("/auth", {
            schema: AuthUserSchema
        }, async (request, reply) => {
            const credentials: UserCredentials = request.body
            
            const result = await this.service.authenticateAndGenerateToken(
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
