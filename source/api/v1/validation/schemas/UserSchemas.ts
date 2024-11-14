import { FastifySchema } from "../../shared/utils/typing/FastifySchemaOverride";
import { excludeProperties, pickProperties } from "typing-assets"
import { BaseUserSchema } from "./base/User"
import { USER_RESPONSES } from "../openapi/responses/UserResponses"

export const CreateUserSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: excludeProperties(
            {...BaseUserSchema.properties},
            "createdAt",
            "updatedAt"
        ),
        required: ['login', 'email', 'password', 'username', 'personalColor', 'isCollaborating'],
    },

    // openapi snippets
    description: "Creates and returns new user",
    tags: ["users"],
    response: USER_RESPONSES.CreateUser
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
    },

    // openapi snippets
    description: "Returns user profile by login",
    tags: ["users"],
    response: USER_RESPONSES.GetUser
}

export const GetMyProfileSchema: FastifySchema = {
    // openapi snippets
    description: "Returns current user profile by provided JWT",
    tags: ["users"],
    response: USER_RESPONSES.GetUser
}

export const UpdateUserSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: pickProperties(
            {...BaseUserSchema.properties},
            "personalColor",
            "username",
            "isCollaborating"
        ),
        required: []
    },

    // openapi snippets
    description: "Updates and returns updated user",
    tags: ["users"],
    response: USER_RESPONSES.UpdateUser
}
