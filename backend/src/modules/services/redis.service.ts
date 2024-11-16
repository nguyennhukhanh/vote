import Redis from 'ioredis';
import { redisConfig } from 'src/configs/redis.config';

export class RedisService {
  private redis: Redis;
  private host: string;
  private port: number;
  private password?: string;

  constructor() {
    this.host = redisConfig.host;
    this.port = Number(redisConfig.port);
    this.password = redisConfig.password;

    this.redis = new Redis({
      host: this.host,
      port: this.port,
      password: this.password,
      lazyConnect: true,
      keepAlive: 1000,
    });

    this.health();
  }

  getClient(): Redis {
    return this.redis;
  }

  health() {
    return this.redis.ping();
  }

  /**
   * This method retrieves data from Redis.
   * @param key - The key of the data to retrieve.
   * @returns The data associated with the key, or null if the key does not exist.
   */
  async get(key: string) {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * This method stores data in Redis.
   * @param key - The key under which to store the data.
   * @param value - The data to store.
   * @param ttl - The time-to-live (in seconds) after which the data should be deleted.
   * @returns A promise that resolves when the data has been stored.
   */
  async set(key: string, value: any, ttl: number) {
    return await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  /**
   * This method deletes data from Redis.
   * @param key - The key of the data to delete.
   * @returns A promise that resolves when the data has been deleted.
   */
  async del(key: string) {
    return await this.redis.del(key);
  }
}
