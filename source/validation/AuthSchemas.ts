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


export const ChangePasswordSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            oldPassword: {
                type: 'string',
                minLength: 8,
                maxLength: 32
            },
            newPassword: {
                type: 'string',
                minLength: 8,
                maxLength: 32
            }
        },
        required: ['oldPassword', 'newPassword']
    }
}