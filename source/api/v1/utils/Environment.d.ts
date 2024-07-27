declare global {
    namespace NodeJS {
        interface ProcessEnv {
            APP_PORT?: string;
            
            DATABASE_HOST?: string;
            DATABASE_PORT?: string;
            DATABASE_NAME?: string;
            DATABASE_USER?: string;
            DATABASE_PASSWORD?: string;
            REDIS_CONNECTION_STRING?: string

            JWT_EXPIRATION?: string;
            JWT_SECRET?: string;
        }
    }
}

export {}