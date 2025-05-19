import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

interface IRedisClient {
  getClient(): RedisClientType;
  isReady(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

class RedisClient implements IRedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;
  private isConnected = false;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 100, 5000);
          logger.warn(`Redis reconnecting (attempt ${retries}), next try in ${delay}ms`);
          return delay;
        },
        connectTimeout: 5000,
      },
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on('error', (err) => {
      logger.error(`Redis Client Error: ${err.message}`);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis connection established');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis ready to accept commands');
      this.isConnected = true;
    });

    this.client.on('end', () => {
      logger.warn('Redis connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis attempting to reconnect...');
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }


public async connect(): Promise<void> {
  if (this.isConnected || this.client.isOpen) return; // Skip if already connected

  try {
    await this.client.connect();
  } catch (err: any) {
    if (err.message.includes("already opened")) return; // Ignore this error
    throw err;
  }
}

  public async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      logger.info('Redis disconnected gracefully');
    } catch (err: any) {
      logger.error(`Failed to disconnect Redis: ${err.message}`);
    }
  }

  public getClient(): RedisClientType {
    if (!this.isConnected) {
      logger.warn('Redis client not connected - returning client anyway');
    }
    return this.client;
  }

  public isReady(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
const redisClient = RedisClient.getInstance();

// Initial connection attempt
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error('Initial Redis connection failed:', err);
    process.exit(1); // Exit if Redis is critical for your app
  }
})();

export default redisClient;