import { NEW_PASSWORD_IS_SAME, WRONG_CREDENTIALS } from "../../../shared/exceptions/AuthExceptions";
import { SERVICE_UNAVAILABLE } from "../../../shared/exceptions/CommonException";
import { USER_NOT_AUTHORIZED } from "../../../shared/exceptions/UserExceptions";


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
                message: {enum: [WRONG_CREDENTIALS.message]}
            }
        },
        503: {
            type: 'object',
            properties: { 
                statusCode: { enum: [503] },
                message: {enum: [SERVICE_UNAVAILABLE.message]}
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
                message: {enum: [NEW_PASSWORD_IS_SAME.message, WRONG_CREDENTIALS.message, "body must have required property 'PROPERTY NAME'"]}
            }
        },
        401: {
            type: 'object',
            properties: {
                statusCode: { enum: [401] },
                message: { enum: [USER_NOT_AUTHORIZED.message] }
            }
        },
        503: {
            type: 'object',
            properties: { 
                statusCode: { enum: [503] },
                message: {enum: [SERVICE_UNAVAILABLE.message]}
            }
        },
    }
} as const