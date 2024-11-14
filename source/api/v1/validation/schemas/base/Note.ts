import { FastifySchema } from "../../../shared/utils/typing/FastifySchemaOverride"

export const BaseNoteSchema = {
    type: 'object',
    properties: {
        id: { 
            type: 'string', 
            maxLength: 16,
            minLength: 16 
        },
        author: {
            type: 'string',
            minLength: 4,
            maxLength: 16
        },
        title: {
            type: 'string',
            minLength: 1,
            maxLength: 100
        },
        content: {
            type: 'string',
            maxLength: 20000
        },
        tags: { 
            type: 'array',
            items: { type: 'string', maxLength: 12 },
            maxItems: 20
        },
        collaborators: { 
            type: 'array',
            items: {
                type: 'string',
                minLength: 4,
                maxLength: 16
            },
            maxItems: 10
        },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
    }
} as const

export const OperateNoteSchema: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' }
        },
        required: ['id']
    }
} as const