import { createClient, RedisClientType } from 'redis';

export const connectAndGetRedisInstance = async (connectionString?: string): Promise<RedisClientType> => {
    const client = await createClient({ url: connectionString })
        .on('error', err => console.log('[FATAL] Redis Client Error', err))
        .on('connect', () => console.log(`[INFO] Connected to redis at ${connectionString}\n`))
        .connect();

    return client as RedisClientType
}