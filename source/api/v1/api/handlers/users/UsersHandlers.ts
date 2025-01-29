import { FastifyInstance } from "fastify";
import { UserUpdate, UserWithoutMetadata, UserWithoutSensetives } from "../../../shared/dto/UserDto";
import { CreateUserSchema, GetMyProfileSchema, GetUserSchema, UpdateUserSchema } from "../../validation/schemas/UserSchemas";
import { extractJwtPayload } from "../../../shared/utils/jwt/PayloadExtractor";
import { extractToken } from "../../../shared/utils/common/TokenExtractor";
import { isException } from "../../../shared/utils/guards/ExceptionGuard";
import { IHandlers } from "../Handler";
import { AuthorizationPreHandler } from "../../prehandlers/AuthPreHandler";
import { IUsersService } from "../../../services/users/UsersServiceInterface";
import { UsersService } from "../../../services/users/UsersService";


export class UsersHandlers implements IHandlers {
    constructor (
        private server: FastifyInstance, 
        private authorizationPreHandler: AuthorizationPreHandler,
        private usersService: IUsersService
    ) {}

    public handleRoutes(): void {
        this.server.post<{
            Body: UserWithoutMetadata,
        }>("/users", { schema: CreateUserSchema }, async (request, reply) => {
    
            const insertData: UserWithoutMetadata = request.body
            let createdUser = await this.usersService.createUser(insertData)
            
            if (isException(createdUser)) {
                reply.code(createdUser.statusCode).send(createdUser)
                return
            }
            
            UsersService.omitSensetiveData(createdUser)
            reply.code(201).send(createdUser)  
        })
    
        this.server.get("/users/me", {
            schema: GetMyProfileSchema,
            preHandler: this.authorizationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
            
            let user = await this.usersService.getUser("login", login)
            if (isException(user)) {
                reply.code(user.statusCode).send(user)
                return
            }

            UsersService.omitSensetiveData(user)
            reply.code(200).send(user)
        })
    
        this.server.patch<{
            Body: Omit<UserUpdate, "password" | "validToken">,
        }>("/users/me", {
            schema: UpdateUserSchema,
            preHandler: this.authorizationPreHandler
        }, async (request, reply) => {
            const { login } = extractJwtPayload(
                extractToken(request)
            )
    
            const updateData = request.body
    
            let updatedUser = await this.usersService.updateUserByLogin(login, updateData)
            if (isException(updatedUser)) {
                reply.code(updatedUser.statusCode).send(updatedUser)
                return
            }

            UsersService.omitSensetiveData(updatedUser)
            reply.code(200).send(updatedUser)
        })
    
        this.server.get<{
            Params: { login: string },
        }>("/users/:login", {
            schema: GetUserSchema,
            preHandler: this.authorizationPreHandler
        }, async (request, reply) => {
            const login: string = request.params.login
            
            let user = await this.usersService.getUser("login", login)
            if (isException(user)) {
                reply.code(user.statusCode).send(user)
                return
            }

            UsersService.omitSensetiveData(user)
            reply.code(200).send(user)
            
        })
    }
}
