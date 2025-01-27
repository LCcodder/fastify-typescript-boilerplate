import { Config } from "./Config";
require('dotenv').config()

export const CONFIG: Config = {
    appPort: parseInt(process.env.PORT || "8080"),

    databaseHost: process.env.DATABASE_HOST || "localhost",
    databasePort: parseInt(process.env.DATABASE_PORT || "5432"),
    databaseName: process.env.DATABASE_NAME || "postgres",
    databaseUser: process.env.DATABASE_USER || "postgres",
    databasePassword: process.env.DATABASE_PASSWORD || "postgres",

    get databaseConnectionString(): string {
        return `postgres://${this.databaseUser}:${this.databasePassword}@${this.databaseHost}:${this.databasePort}/${this.databaseName}`
    },

    redisConnectionString: process.env.REDIS_CONNECTION_STRING || "redis://127.0.0.1:6379/0",

    jwtSecret: process.env.JWT_SECRET || "SECRET",
    jwtExpiration: process.env.JWT_EXPIRATION || "24h",

    log: function (): void {
        console.log(`[INFO] Webapp loaded with config:\nPORT: ${this.appPort}\nDATABASE CONNECTION: ${this.databaseConnectionString}\nJWT SECRET: ${this.jwtSecret}\nJWT EXPIRATION: ${this.jwtExpiration}\n`)
    }
}