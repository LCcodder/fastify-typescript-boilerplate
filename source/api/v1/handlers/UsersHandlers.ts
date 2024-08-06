import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { IUsersService } from "../services/users/UsersServiceInterface";
import { User, UserUpdate, UserWithoutMetadata, UserWithoutSensetives } from "../database/entities/User";
import { USER_EXCEPTIONS } from "../exceptions/UserExceptions";
import { CreateUserSchema, GetMyProfileSchema, GetUserSchema, UpdateUserSchema } from "../validation/schemas/UserSchemas";
import { UsersService } from "../services/users/UsersService";
import { extractJwtPayload } from "../auth/jwt/PayloadExtractor";
import { extractToken } from "../utils/TokenExtractor";
import { isException } from "../utils/guards/ExceptionGuard";


export const handleUserRoutes = (
    server: FastifyInstance, 
    usersService: IUsersService, 
    // auth prehandler, which have to be generated in main.ts file
    authenticate: (
        request: FastifyRequest, 
        reply: FastifyReply, 
        done: HookHandlerDoneFunction
    ) => void
) => {
    server.post<{
        Body: UserWithoutMetadata,
        Reply: {
            201: UserWithoutSensetives,
            400: typeof USER_EXCEPTIONS.AlreadyExists,
            503: typeof USER_EXCEPTIONS.ServiceUnavailable
        }
    }>("/users", {schema: CreateUserSchema}, async (request, reply) => {

            const insertData: UserWithoutMetadata = request.body
            let createdUser = await usersService.createUser(insertData)
            
            if (isException(createdUser)) {
                reply.code(createdUser.statusCode).send(createdUser)
                return
            }
            
            UsersService.omitSensetiveData(createdUser)

            reply.code(201).send(createdUser)
        
    })

    server.get<{
        Reply: {
            200: UserWithoutSensetives,
            404: typeof USER_EXCEPTIONS.NotFound,
            503: typeof USER_EXCEPTIONS.ServiceUnavailable,
        }
    }>("/users/me", {
        schema: GetMyProfileSchema,
        preHandler: authenticate
    }, async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )
            
            let user = await usersService.getUser("login", payload.login)
            if (isException(user)) {
                reply.code(user.statusCode).send(user)
                return
            }
            UsersService.omitSensetiveData(user)

            reply.code(200).send(user)
        
    })

    server.patch<{
        Body: Omit<UserUpdate, "password" | "validToken">,
        Reply: {
            200: UserWithoutSensetives,
            404: typeof USER_EXCEPTIONS.NotFound,
            503: typeof USER_EXCEPTIONS.ServiceUnavailable
        }
    }>("/users/me", {
        schema: UpdateUserSchema,
        preHandler: authenticate
    }, async (request, reply) => {
            const payload = extractJwtPayload(
                extractToken(request)
            )
            const updateData = request.body

            let updatedUser = await usersService.updateUserByLogin(payload.login, updateData)
            if (isException(updatedUser)) {
                reply.code(updatedUser.statusCode).send(updatedUser)
                return
            }
            UsersService.omitSensetiveData(updatedUser)

            reply.code(200).send(updatedUser)
        
    })

    server.get<{
        Params: { login: string },
        Reply: {
            200: UserWithoutSensetives,
            404: typeof USER_EXCEPTIONS.NotFound,
            503: typeof USER_EXCEPTIONS.ServiceUnavailable
        }
    }>("/users/:login", {
        schema: GetUserSchema,
        preHandler: authenticate
    }, async (request, reply) => {
            const login: string = request.params.login
            
            let user = await usersService.getUser("login", login)
            if (isException(user)) {
                reply.code(user.statusCode).send(user)
                return
            }
            UsersService.omitSensetiveData(user)

            reply.code(200).send(user)
        
    })
}