import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { IUsersService } from "../services/users/IUsersService";
import { User, UserUpdate, UserWithoutMetadata, UserWithoutSensetives } from "../actors/User";
import { UserExceptions } from "../services/users/UserExceptions";
import { RegisterUserSchema, GetUserByUsernameSchema, UpdateUserSchema } from "./validation/UserSchemas";
import { UsersService } from "../services/users/UsersService";
import { extractJwtPayload } from "../auth/jwt/PayloadExtractor";
import { extractToken } from "../utils/TokenExtractor";


export const handleUserRoutes = (
    server: FastifyInstance, 
    usersService: IUsersService, 
    // auth prehandler, which have to be generated in main.ts file
    authentification: (request: FastifyRequest, 
        reply: FastifyReply, 
        done: HookHandlerDoneFunction
    ) => void
) => {
    server.post<{
        Body: UserWithoutMetadata,
        Reply: {
            201: User,
            400: typeof UserExceptions.AlreadyExists,
            503: typeof UserExceptions.ServiceUnavailable
        }
    }>("/users/create", {schema: RegisterUserSchema}, async (request, reply) => {
        try {
            const insertData: UserWithoutMetadata = request.body
            const state = await usersService.createUser(insertData) as User
            reply.code(201).send(state)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })

    server.get<{
        Reply: {
            200: UserWithoutSensetives,
            404: typeof UserExceptions.NotFound,
            503: typeof UserExceptions.ServiceUnavailable,
        }
    }>("/users/me", {
        preHandler: authentification
    }, async (request, reply) => {
        try {
            const payload = extractJwtPayload(
                extractToken(request)
            )
            let user = await usersService.getUser("email", payload.email) as User
            UsersService.omitSensetiveData(user)

            reply.code(200).send(user)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })

    server.patch<{
        Body: Omit<UserUpdate, "password" | "validToken">,
        Reply: {
            200: UserWithoutSensetives,
            404: typeof UserExceptions.NotFound,
            503: typeof UserExceptions.ServiceUnavailable,
            400: typeof UserExceptions.AlreadyExists
        }
    }>("/users/me", {
        schema: UpdateUserSchema,
        preHandler: authentification
    }, async (request, reply) => {
        try {
            const payload = extractJwtPayload(
                extractToken(request)
            )
            const updateData = request.body

            let updatedUser = await usersService.updateUserByEmail(payload.email, updateData) as User
            UsersService.omitSensetiveData(updatedUser)

            reply.code(200).send(updatedUser)
        } catch (exception: any) {
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })

    server.get<{
        Params: { username: string },
        Reply: {
            200: UserWithoutSensetives,
            404: typeof UserExceptions.NotFound,
            503: typeof UserExceptions.ServiceUnavailable
        }
    }>("/users/:username", {schema: GetUserByUsernameSchema}, async (request, reply) => {
        try {
            const username: string = request.params.username
            let user = await usersService.getUser("username", username) as User
            UsersService.omitSensetiveData(user)
            reply.code(200).send(user)
        } catch (exception: any) { 
            reply.code(
                exception.statusCode
            ).send(exception)
        }
    })
}