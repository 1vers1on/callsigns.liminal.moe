import type { Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { login } from '$lib/server/auth';
import { json, fail, redirect } from '@sveltejs/kit';
import { signAccessToken, createRefreshToken } from '$lib/server/auth';
import { checkRateLimit, resetRateLimit } from '$lib/server/rateLimit';
import bcrypt from 'bcrypt';

const LOGIN_RATE_LIMIT = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000
};

export const actions: Actions = {
    login: async ({ request, cookies, getClientAddress }) => {
        const data = await request.formData();

        const email = data.get('email');
        const password = data.get('password');

        if (!email || !password) {
            return fail(400, { error: 'Email and password required' });
        }

        const clientIp = getClientAddress();
        const rateLimitKey = `login:${clientIp}:${email}`;

        const rateLimit = await checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT);
        
        if (!rateLimit.success) {
            const waitMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
            
            if (rateLimit.blocked) {
                return fail(429, { 
                    error: `Too many login attempts. Account temporarily locked. Try again in ${waitMinutes} minutes.`,
                    resetTime: rateLimit.resetTime
                });
            }
            
            return fail(429, { 
                error: `Rate limit exceeded. Try again in ${waitMinutes} minutes.`,
                resetTime: rateLimit.resetTime
            });
        }

        try {
            const { refreshToken } = await login(email as string, password as string);
            
            await resetRateLimit(rateLimitKey);
            
            cookies.set('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30
            });
        } catch (err) {
            if (err instanceof Error) {
                if (err.message === 'Email not verified') {
                    return fail(403, { error: 'Email not verified' });
                }

                if (err.message === 'User not found') {
                    return fail(404, { error: 'User not found' });
                }

                if (err.message === 'Invalid password') {
                    return fail(401, { 
                        error: 'Invalid password',
                        remainingAttempts: rateLimit.remainingAttempts - 1
                    });
                }

                return fail(500, { error: 'Internal Server Error' });
            }
        }

        const url = new URL(request.url);
        const redirectTo = url.searchParams.get('redirect') || '/';

        throw redirect(302, redirectTo);
    }
};