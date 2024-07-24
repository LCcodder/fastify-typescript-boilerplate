import { excludeProperties } from "typing-assets";
import { BaseUserSchema } from "../../schemas/base/User";
import { USER_EXCEPTIONS } from "../../../exceptions/UserExceptions";

export const USER_RESPONSES = {
    CreateUser: {
        201: {
            type: 'object',
            properties: excludeProperties(
                {...BaseUserSchema.properties},
                "password"
            )
        },
        400: {
            type: 'object',
            properties: {
                statusCode: {enum: [400]},
                message: {enum: [USER_EXCEPTIONS.AlreadyExists.message, "body must have required property 'PROPERTY NAME'"]}
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: {enum: [503]},
                message: {enum: [USER_EXCEPTIONS.ServiceUnavailable.message]}
            }
        },
        
    },
    GetUser: {
        200: {
            type: 'object',
            properties: excludeProperties(
                {...BaseUserSchema.properties},
                "password"
            )
        }, 
        404: {
            type: 'object',
            properties: {
                statusCode: { enum: [404] },
                message: { enum: [USER_EXCEPTIONS.NotFound.message] }
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
                statusCode: {enum: [503]},
                message: {enum: [USER_EXCEPTIONS.ServiceUnavailable.message]}
            }
        },
    },
    UpdateUser: {
        200: {
            type: 'object',
            properties: excludeProperties(
                {...BaseUserSchema.properties},
                "password"
            )
        }, 
        400: {
            type: 'object',
            properties: {
                statusCode: {enum: [400]},
                message: {enum: ["body must have required property 'PROPERTY NAME'"]}
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
                statusCode: {enum: [503]},
                message: {enum: [USER_EXCEPTIONS.ServiceUnavailable.message]}
            }
        },
    }
} as const