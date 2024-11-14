export const BaseUserSchema = {
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
            minLength: 6,
            maxLength: 13
        },
        isCollaborating: {
            type: 'boolean'
        },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
    },
} as const