import { FastifyInstance } from "fastify";
import { IUsersService } from "../services/users/IUsersService";
import { User, UserWithoutMetadata } from "../actors/User";
import { UsersService } from "../services/users/UsersService";
import { Exception } from "../utils/Exception";
import { UserExceptions } from "../services/users/UserExceptions";
import { AddUserSchema, GetUserByIdSchema } from "./schemas/UserSchemas";

export const handleUserRoutes = (server: FastifyInstance, usersService: IUsersService) => {
    server.post<{
        Body: UserWithoutMetadata,
        Reply: {
            201: User,
            400: typeof UserExceptions.AlreadyExists,
            503: typeof UserExceptions.ServiceUnavailable
        }
    }>("/users", {schema: AddUserSchema}, async (request, reply) => {
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
        Params: { id: string },
        Reply: {
            404: typeof UserExceptions.NotFound,
            503: typeof UserExceptions.ServiceUnavailable
        }
    }>("/users", {schema: GetUserByIdSchema}, async (request, reply) => {
        try {
            
        } catch (exception: unknown) {
            reply.code(
                (exception as typeof UserExceptions.NotFound 
                    | typeof UserExceptions.ServiceUnavailable
                ).statusCode
            ).send(exception as any)
        }
    })
}