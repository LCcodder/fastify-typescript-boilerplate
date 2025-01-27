import { excludeProperties } from "typing-assets";
import { BaseUserSchema } from "../../validation/schemas/base/User";
import { USER_ALREADY_EXISTS, USER_NOT_AUTHORIZED, USER_NOT_FOUND } from "../../../shared/exceptions/UserExceptions";
import { SERVICE_UNAVAILABLE } from "../../../shared/exceptions/CommonException";

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
                message: {enum: [USER_ALREADY_EXISTS.message, "body must have required property 'PROPERTY NAME'"]}
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: {enum: [503]},
                message: {enum: [SERVICE_UNAVAILABLE.message]}
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
                message: { enum: [USER_NOT_FOUND.message] }
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
                statusCode: {enum: [503]},
                message: {enum: [SERVICE_UNAVAILABLE.message]}
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
                message: { enum: [USER_NOT_AUTHORIZED.message] }
            }
        },
        503: {
            type: 'object',
            properties: {
                statusCode: {enum: [503]},
                message: {enum: [SERVICE_UNAVAILABLE.message]}
            }
        },
    }
} as const