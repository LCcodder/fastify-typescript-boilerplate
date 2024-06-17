import { FastifySchema } from "fastify"

export const CreateNoteSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            collaborators: {
                type: 'array',
                maxItems: 10
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
                maxItems: 20
            }
        },
        required: ['collaborators', 'title', 'content', 'tags']
    }
}

export const GetNotesSchema: FastifySchema = {
    querystring: {
        type: 'object',
        properties: {
            limit: { type: 'integer', minimum: 0 },
            offset: { type: 'integer', minimum: 0 }
        }   
    }
}

export const OperateNoteSchema: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' }
        },
        required: ['id']
    }
}

export const UpdateNoteSchema: FastifySchema = {
    ...OperateNoteSchema,
    body: {
        type: 'object',
        properties: {
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
                maxItems: 20
            }
        },
        required: []
    }
}

export const AddOrRemoveCollaboratorSchema: FastifySchema = {
    ...OperateNoteSchema,
    body: {
        type: 'object',
        properties: {
            collaboratorLogin: { type: 'string' }
        },
        required: ['collaboratorLogin']
    }
}