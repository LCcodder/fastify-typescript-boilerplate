declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT?: string;
            MONGODB_CONNECTION?: string;
            JWT_EXPIRATION?: string;
            JWT_SECRET?: string;
        }
    }
}

export {}