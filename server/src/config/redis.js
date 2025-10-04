import { createClient } from 'redis';

// Create client lazily after env vars are loaded
let redisClient = null;

export function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient({
            username: 'default',
            password: 'Uf7cWIgKbz4wCKPxplNhFRpj0rG2dT7s',
            socket: {
                host: process.env.REDIS_URL || 'localhost',
                port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379
            },
        });

        redisClient.on('error', (err) => console.error('Redis Client Error', err));
        redisClient.on('connect', () => console.log('Redis Client Connected'));
    }
    
    return redisClient;
}

export default getRedisClient;
