export const UserExceptions = {
    AlreadyExists: {
        statusCode: 400,
        message: "User alredy exists"
    },

    ServiceUnavailable: {
        statusCode: 503,
        message: "Cannot create user, service unavalable"
    },

    NotFound: {
        statusCode: 404,
        message: "User not found"
    }
} as const