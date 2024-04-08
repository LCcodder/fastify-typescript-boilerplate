export const UserExceptions = {
    AlreadyExists: {
        statusCode: 400,
        message: "User already exists"
    },

    ServiceUnavailable: {
        statusCode: 503,
        message: "Cannot create user, service unavalable"
    },

    NotFound: {
        statusCode: 404,
        message: "User not found"
    },

    NotAuthorized: {
        statusCode: 401,
        message: "Authorization token niether is not valid or is not generated by server"
    }
} as const