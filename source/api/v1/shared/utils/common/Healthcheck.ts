import { RedisClientType } from "redis";
import { DataSource } from "typeorm";
import { withExceptionCatch } from "../../decorators/WithExceptionCatch";

export type SystemReport = {
    databaseAccess: boolean;
    cacheAccess: boolean;
    serverUptimeInSec: number;
    databaseUptimeInSec: number;
}

export default class Healthcheck {
    constructor(
        private redis: RedisClientType, 
        private dataSource: DataSource
    ) {}

    private async isRedisAccesible(): Promise<boolean> {
        try {
            await this.redis.PING()
            return true
        } catch {
            return false
        }
    }

    private async isPostgreSQLAccesible(): Promise<boolean> {
        try {
            await this.dataSource.query("SELECT user;")
            return true
        } catch {
            return false
        }
    }

    private async getPostgreSQLUptime(): Promise<number> {
        try {
            const result = await this.dataSource.query("SELECT FLOOR(EXTRACT('epoch' from current_timestamp - pg_postmaster_start_time()));")
            return parseInt(result[0]["floor"])
        } catch {
            return 0
        }
    }

    private getProccessUptime(): number {
        return Math.floor(process.uptime())
    }

    @withExceptionCatch
    public async getFullSystemReport(): Promise<SystemReport> {
        return {
            databaseAccess: await this.isPostgreSQLAccesible(),
            cacheAccess: await this.isRedisAccesible(),
            serverUptimeInSec: this.getProccessUptime(),
            databaseUptimeInSec: await this.getPostgreSQLUptime(),
        }
    }
}