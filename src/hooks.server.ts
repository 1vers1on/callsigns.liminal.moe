import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { startBackgroundUpdate } from '$lib/server/solarData';
import { checkRateLimit, type RateLimitConfig } from '$lib/server/rateLimit';

startBackgroundUpdate(15);

const rateLimitConfig: RateLimitConfig = {
    maxAttempts: 100, // Allow 100 requests
    windowMs: 60 * 1000, // Per 60 seconds (1 minute)
    blockDurationMs: 2 * 60 * 1000 // Block for 2 minutes if limit exceeded
};

const handleRateLimit: Handle = async ({ event, resolve }) => {
    const ip = event.getClientAddress();

    const result = await checkRateLimit(ip, rateLimitConfig);

    if (!result.success) {
        return new Response('Too many requests', {
            status: 429,
            headers: {
                'X-RateLimit-Limit': rateLimitConfig.maxAttempts.toString(),
                'X-RateLimit-Remaining': result.remainingAttempts.toString(),
                'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
                'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
            }
        });
    }

    event.locals.rateLimit = result;

    return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
    paraglideMiddleware(event.request, ({ request, locale }) => {
        event.request = request;
        return resolve(event, {
            transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
        });
    });

export const handle = sequence(handleRateLimit, handleParaglide);