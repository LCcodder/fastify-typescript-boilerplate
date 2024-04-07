import { FastifyInstance } from "fastify";
import { IUsersService } from "../services/users/IUsersService";
import { User, UserWithoutMetadata } from "../actors/User";
import { UserExceptions } from "../services/users/UserExceptions";
import { AddUserSchema, GetUserByUsernameSchema } from "./schemas/UserSchemas";
import { ObjectId } from "mongoose"


export const handleUserRoutes = (server: FastifyInstance, usersService: IUsersService) => {
    server.post<{
        Body: UserWithoutMetadata,
        Reply: {
            201: User,
            400: typeof UserExceptions.AlreadyExists,
            503: typeof UserExceptions.ServiceUnavailable
        }
    }>("/users/create", {schema: AddUserSchema}, async (request, reply) => {
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


    server.get<{
        Params: { username: string },
        Reply: {
            200: User,
            404: typeof UserExceptions.NotFound,
            503: typeof UserExceptions.ServiceUnavailable
        }
    }>("/users/:username", {schema: GetUserByUsernameSchema}, async (request, reply) => {
        try {
            const username: string = request.params.username
            const user = await usersService.getUser("username", username) as User
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