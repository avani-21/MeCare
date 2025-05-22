"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../utils/logger"));
class RedisClient {
    constructor() {
        this.isConnected = false;
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries) => {
                    const delay = Math.min(retries * 100, 5000);
                    logger_1.default.warn(`Redis reconnecting (attempt ${retries}), next try in ${delay}ms`);
                    return delay;
                },
                connectTimeout: 5000,
            },
        });
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.client.on('error', (err) => {
            logger_1.default.error(`Redis Client Error: ${err.message}`);
            this.isConnected = false;
        });
        this.client.on('connect', () => {
            logger_1.default.info('Redis connection established');
            this.isConnected = true;
        });
        this.client.on('ready', () => {
            logger_1.default.info('Redis ready to accept commands');
            this.isConnected = true;
        });
        this.client.on('end', () => {
            logger_1.default.warn('Redis connection closed');
            this.isConnected = false;
        });
        this.client.on('reconnecting', () => {
            logger_1.default.info('Redis attempting to reconnect...');
        });
    }
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnected || this.client.isOpen)
                return; // Skip if already connected
            try {
                yield this.client.connect();
            }
            catch (err) {
                if (err.message.includes("already opened"))
                    return; // Ignore this error
                throw err;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.disconnect();
                logger_1.default.info('Redis disconnected gracefully');
            }
            catch (err) {
                logger_1.default.error(`Failed to disconnect Redis: ${err.message}`);
            }
        });
    }
    getClient() {
        if (!this.isConnected) {
            logger_1.default.warn('Redis client not connected - returning client anyway');
        }
        return this.client;
    }
    isReady() {
        return this.isConnected;
    }
}
// Singleton instance
const redisClient = RedisClient.getInstance();
// Initial connection attempt
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.connect();
    }
    catch (err) {
        logger_1.default.error('Initial Redis connection failed:', err);
        process.exit(1); // Exit if Redis is critical for your app
    }
}))();
exports.default = redisClient;
