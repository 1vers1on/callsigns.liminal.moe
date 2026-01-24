import { Redis } from 'ioredis';
import { env } from '$env/dynamic/private';
import 'dotenv/config';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redis) {
        redis = new Redis(env.REDIS_URL || 'redis://localhost:6379');
    }
    return redis;
}

export interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
    blockDurationMs?: number;
}

export interface RateLimitResult {
    success: boolean;
    remainingAttempts: number;
    resetTime: number;
    blocked?: boolean;
}

export async function checkRateLimit(
    key: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const client = getRedisClient();
    const now = Date.now();
    const windowKey = `ratelimit:${key}`;
    const blockKey = `ratelimit:block:${key}`;

    if (config.blockDurationMs) {
        const blocked = await client.get(blockKey);
        if (blocked) {
            const ttl = await client.ttl(blockKey);
            return {
                success: false,
                remainingAttempts: 0,
                resetTime: now + ttl * 1000,
                blocked: true
            };
        }
    }

    const multi = client.multi();
    multi.incr(windowKey);
    multi.pexpire(windowKey, config.windowMs);

    const results = await multi.exec();
    const attempts = results?.[0]?.[1] as number;

    const remainingAttempts = Math.max(0, config.maxAttempts - attempts);
    const resetTime = now + config.windowMs;

    if (attempts > config.maxAttempts) {
        if (config.blockDurationMs) {
            await client.set(blockKey, '1', 'PX', config.blockDurationMs);
        }

        return {
            success: false,
            remainingAttempts: 0,
            resetTime: config.blockDurationMs ? now + config.blockDurationMs : resetTime,
            blocked: !!config.blockDurationMs
        };
    }

    return {
        success: true,
        remainingAttempts,
        resetTime
    };
}

export async function resetRateLimit(key: string): Promise<void> {
    const client = getRedisClient();
    await client.del(`ratelimit:${key}`, `ratelimit:block:${key}`);
}

export async function getRateLimitStatus(
    key: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const client = getRedisClient();
    const now = Date.now();
    const windowKey = `ratelimit:${key}`;
    const blockKey = `ratelimit:block:${key}`;

    if (config.blockDurationMs) {
        const blocked = await client.get(blockKey);
        if (blocked) {
            const ttl = await client.ttl(blockKey);
            return {
                success: false,
                remainingAttempts: 0,
                resetTime: now + ttl * 1000,
                blocked: true
            };
        }
    }

    const attempts = await client.get(windowKey);
    const currentAttempts = attempts ? parseInt(attempts) : 0;
    const remainingAttempts = Math.max(0, config.maxAttempts - currentAttempts);

    const ttl = await client.pttl(windowKey);
    const resetTime = ttl > 0 ? now + ttl : now + config.windowMs;

    return {
        success: currentAttempts < config.maxAttempts,
        remainingAttempts,
        resetTime
    };
}
