import { createClient, RedisClientType } from 'redis';
import { LOGGER } from '../shared/utils/common/Logger';

export const connectAndGetRedisInstance = async (connectionString?: string): Promise<RedisClientType> => {
    const client = await createClient({ url: connectionString })
        .on('error', err => LOGGER.error(`Redis Client Error ${err}`))
        .on('connect', () => LOGGER.log('info', `Connected to redis at ${connectionString}\n`))
        .connect();

    return client as RedisClientType
}