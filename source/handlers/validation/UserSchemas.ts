import { FastifySchema } from "fastify"

export const RegisterUserSchema: FastifySchema = {
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
            },
            username: {
                type: 'string',
                minLength: 4,
                maxLength: 32
            },
            personalColor: {
                type: 'string',
                minLength: 7,
                maxLength: 7
            }
        },
        required: ['email', 'password', 'username', 'personalColor'],
    }
}

export const GetUserByUsernameSchema: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            username: {
                type: 'string'
            }
        }
    }
}

export const GetMyProfileSchema: FastifySchema = {}

export const UpdateUserSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            username: {
                type: 'string',
                minLength: 4,
                maxLength: 32
            },
            personalColor: {
                type: 'string',
                minLength: 7,
                maxLength: 7
            }
        }
    }
}