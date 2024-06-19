import { FastifySchema } from "fastify"

export const RegisterUserSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            login: {
                type: 'string',
                minLength: 4,
                maxLength: 16
            },
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
            },
            isCollaborating: {
                type: 'boolean'
            }
        },
        required: ['email', 'password', 'username', 'personalColor', 'isCollaborating'],
    }
}

export const GetUserSchema: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            login: {
                type: 'string'
            }
        },
        required: ['login']
        
    }
}

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
            },
            isCollaborating: {
                type: 'boolean'
            }
        }
    }
}
