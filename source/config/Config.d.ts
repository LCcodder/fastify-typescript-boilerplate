export declare type Config = {
    port: number,
    mongodbConnectionString: string,
    jwtSecret: string,
    // in '*h' format
    jwtExpiration: string
}