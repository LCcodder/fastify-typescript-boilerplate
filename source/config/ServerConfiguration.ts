import { Config } from "./Config";
require('dotenv').config()

export const CONFIG: Config = {
    port: parseInt(process.env.PORT ||  "8080") ,
    mongodbConnectionString: process.env.MONGODB_CONNECTION || "mongodb://localhost:27017/",
    jwtSecret: process.env.JWT_SECRET || "SECRET",
    jwtExpiration: process.env.JWT_EXPIRATION || "24h",
    log: function (): void {
        console.log(`[INFO] Webapp loaded with config:\nPORT: ${this.port}\nMONGO CONNECTION: ${this.mongodbConnectionString}\nJWT SECRET: ${this.jwtSecret}\nJWT EXPIRATION: ${this.jwtExpiration}\n`)
    }
}