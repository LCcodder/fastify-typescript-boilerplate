import { FastifySchema } from "fastify";

export const AuthUserSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            email: {
                type: 'string',
                minLength: 8,
                maxLength: 60
            },
            password: {
                type: 'string',
                minLength: 8,
                maxLength: 32
            }
        },
        required: ['email', 'password'],
    }
}