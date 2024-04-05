import { FastifySchema } from "fastify"

export const AddUserSchema: FastifySchema = {
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

export const GetUserByIdSchema: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            id: {
                type: 'string'
            }
        }
    }
}

export const GetMyProfileSchema: FastifySchema = {
    
}

export const UpdateUserSchema: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            id: {type: 'string'}
        }
    },
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
        }
    }
}