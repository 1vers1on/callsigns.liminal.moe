import type { Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { login } from '$lib/server/auth';
import { json, fail, redirect } from '@sveltejs/kit';
import { signAccessToken, createRefreshToken } from '$lib/server/auth';
import bcrypt from 'bcrypt';

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();

        const email = data.get('email');
        const password = data.get('password');

        try {
            const { refreshToken } = await login(email as string, password as string);
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
                    return fail(401, { error: 'Invalid password' });
                }

                return fail(500, 'Internal Server Error');
            }
        }

        throw redirect(302, '/');
    }
};
