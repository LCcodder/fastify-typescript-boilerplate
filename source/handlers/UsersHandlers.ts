import { FastifyInstance } from "fastify";
import { IUsersService } from "../services/users/IUsersService";
import { User, UserUpdate, UserWithoutMetadata, UserWithoutSensetives } from "../actors/User";
import { UserExceptions } from "../services/users/UserExceptions";
import { RegisterUserSchema, GetUserByUsernameSchema, UpdateUserSchema } from "./schemas/UserSchemas";
import { UsersService } from "../services/users/UsersService";


export const handleUserRoutes = (server: FastifyInstance, usersService: IUsersService) => {
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
        } catch (exception: unknown) {
            reply.code(
                (exception as typeof UserExceptions.AlreadyExists 
                    | typeof UserExceptions.ServiceUnavailable
                ).statusCode
            ).send(exception as any)
        }
    })

    server.get<{}>("/users/me", {preHandler: (request, reply, done) => {done()}}, () => {})

    server.patch<{
        Params: {username: string},
        Body: Omit<UserUpdate, "password" | "validToken">,
        Reply: {
            200: UserWithoutSensetives,
            404: typeof UserExceptions.NotFound,
            503: typeof UserExceptions.ServiceUnavailable
        }
    }>("/users/:username", {
        schema: UpdateUserSchema,
    }, async (request, reply) => {
        try {
            const username: string = request.params.username
            const updateData = request.body
            let updatedUser = await usersService.updateUserByUsername(username, updateData) as User
            UsersService.omitSensetiveData(updatedUser)
            reply.code(200).send(updatedUser)
        } catch (exception: unknown) {
            reply.code(
                (exception as typeof UserExceptions.NotFound 
                    | typeof UserExceptions.ServiceUnavailable
                ).statusCode
            ).send(exception as any)
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
        } catch (exception: unknown) { 
            reply.code(
                (exception as typeof UserExceptions.NotFound 
                    | typeof UserExceptions.ServiceUnavailable
                ).statusCode
            ).send(exception as any)
        }
    })
}