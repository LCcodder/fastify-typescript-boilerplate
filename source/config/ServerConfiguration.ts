import { Config } from "./Config";
require('dotenv').config()

const loadConfig = (): Config => {
    return {
        // parsing port to number for fastify config
        port: parseInt(process.env.PORT ||  "8080") ,
        mongodbConnectionString: process.env.MONGODB_CONNECTION || "mongodb://localhost:27017/",
        jwtSecret: process.env.JWT_SECRET || "SECRET",
        jwtExpiration: process.env.JWT_EXPIRATION || "24h"
    }
}

export default loadConfig