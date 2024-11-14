export declare interface Config {
    appPort: number

    databaseHost: string
    databasePort: number
    databaseName: string
    databaseUser: string
    databasePassword: string

    redisConnectionString: string

    get databaseConnectionString(): string

    jwtSecret: string,
    // in '*h' format
    jwtExpiration: string,
    log: () => void
}