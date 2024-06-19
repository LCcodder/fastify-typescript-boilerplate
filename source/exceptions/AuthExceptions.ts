export const AuthExceptions = {
    WrongCredentials: {
        statusCode: 400,
        message: "Wrong credentials"
    },
    ServiceUnavailable: {
        statusCode: 503,
        message: "Cannot create auth, service unavalable"
    },
} as const