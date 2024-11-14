import { pickProperties } from "typing-assets";
import { BaseUserSchema } from "./base/User";
import { AUTH_RESPONSES } from "../openapi/responses/AuthResponses";
import { FastifySchema } from "../../shared/utils/typing/FastifySchemaOverride";

export const AuthUserSchema: FastifySchema = {
    
    body: {
        type: 'object',
        properties: pickProperties(
            {...BaseUserSchema.properties},
            "email",
            "password"
        ),
        required: ['email', 'password'],
    },

    // openapi snippets
    description: 'Authorization with email and password which returns token in response',
    tags: ["auth"],
    response: AUTH_RESPONSES.Authorize
}


export const ChangePasswordSchema: FastifySchema = {
    
    body: {
        type: 'object',
        properties: {
            oldPassword: BaseUserSchema.properties.password,
            newPassword: BaseUserSchema.properties.password
        },
        required: ['oldPassword', 'newPassword']
    },

    // openapi snippets
    description: 'Password change and reset current token',
    tags: ["auth"],
    response: AUTH_RESPONSES.ChangePassword
}