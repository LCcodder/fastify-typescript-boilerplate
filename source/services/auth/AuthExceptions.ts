export const AuthExceptions = {
    WrongCredentials: {
        statusCode: 400,
        message: "Wrong email or password"
    },
    ServiceUnavailable: {
        statusCode: 503,
        message: "Cannot create auth, service unavalable"
    },
} as const