import { AUTH_EXCEPTIONS } from "../../shared/exceptions/AuthExceptions";
import { USER_EXCEPTIONS } from "../../shared/exceptions/UserExceptions";

export const AUTH_RESPONSES = {
    Authorize: {
        200: {
            type: 'object',
            properties: { 
                token: { type: 'string' }, 
                expiresIn: { type: 'string' }
            }
        },
        400: {
            type: 'object',
            properties: { 
                statusCode: { enum: [400] },
                message: {enum: [AUTH_EXCEPTIONS.WrongCredentials.message]}
            }
        },
        503: {
            type: 'object',
            properties: { 
                statusCode: { enum: [503] },
                message: {enum: [AUTH_EXCEPTIONS.ServiceUnavailable.message]}
            }
        },
    },
    ChangePassword: {
        200: {
            type: 'object',
            properties: { 
                success: { enum: [true] }
            }
        },
        400: {
            type: 'object',
            properties: { 
                statusCode: { enum: [400] },
                message: {enum: [AUTH_EXCEPTIONS.NewPasswordIsSame.message, AUTH_EXCEPTIONS.WrongCredentials.message, "body must have required property 'PROPERTY NAME'"]}
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_EXCEPTIONS.NotAuthorized.message] }
            }
        },
        503: {
            type: 'object',
            properties: { 
                statusCode: { enum: [503] },
                message: {enum: [AUTH_EXCEPTIONS.ServiceUnavailable.message]}
            }
        },
    }
} as const