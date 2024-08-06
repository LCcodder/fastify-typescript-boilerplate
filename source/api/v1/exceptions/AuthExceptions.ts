import { Exception } from "../utils/Exception";

export const AUTH_EXCEPTIONS = {
    WrongCredentials: {
        statusCode: 400,
        message: "Wrong credentials"
    },
    NewPasswordIsSame: {
        statusCode: 400,
        message: "New password can not be same as old"
    },
    ServiceUnavailable: {
        statusCode: 503,
        message: "Auth service unavalable"
    },
} as const satisfies Record<string, Exception>