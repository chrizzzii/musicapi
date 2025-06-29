const redis = require('redis');

class RedisCacheService {
    constructor() {
        this._client = redis.createClient({
            socket: {
                host: process.env.REDIS_SERVER,
            },
        });

        this._client.on('error', (err) => {
            console.error('Redis Client Error', err);
        });

        this._client.connect();
    }

    async set(key, value, expirationInSecond = 1800) {
        await this._client.set(key, value, {
            EX: expirationInSecond,
        });
    }

    async get(key) {
        const result = await this._client.get(key);
        if (result === null) {
            throw new Error('Cache tidak ditemukan');
        }
        return result;
    }

    async delete(key) {
        await this._client.del(key);
    }
}

module.exports = RedisCacheService;
