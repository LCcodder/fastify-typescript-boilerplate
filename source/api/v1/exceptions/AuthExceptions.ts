import { Exception } from "../utils/Exception";

export const AUTH_EXCEPTIONS = {
    WrongCredentials: {
        statusCode: 400,
        message: "Wrong credentials"
    },
    ServiceUnavailable: {
        statusCode: 503,
        message: "Cannot create auth, service unavalable"
    },
} as const satisfies Record<string, Exception>