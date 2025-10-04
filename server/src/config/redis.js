import { createClient } from 'redis';

const redisClient = createClient({
    username: 'default',
    password: 'Uf7cWIgKbz4wCKPxplNhFRpj0rG2dT7s',
    socket: {
        host: process.env.REDIS_URL || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379
    },
});
redisClient.on('error', (err) => console.error('Redis Client Error', err, process.env.REDIS_HOST, process.env.REDIS_PORT));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect to Redis
await redisClient.connect();

export default redisClient;
