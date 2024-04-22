import { FastifySchema } from "fastify"

export const CreateNoteSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            collaborators: {
                type: 'array',
                maxLength: 10
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
                maxLength: 20
            }
        },
        required: ['collaborators', 'title', 'content', 'tags']
    }
}