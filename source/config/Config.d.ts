export declare interface Config {
    port: number,
    mongodbConnectionString: string,
    jwtSecret: string,
    // in '*h' format
    jwtExpiration: string,
    log: () => void
}