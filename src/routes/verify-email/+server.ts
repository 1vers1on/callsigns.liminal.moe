import { error, redirect } from '@sveltejs/kit';
import { createHash } from 'crypto';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    if (!token || !email) {
        throw error(400, 'missing token or email');
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw error(400, 'user not found');
    }

    if (!user.emailToken || !user.emailTokenExpires) {
        throw error(400, 'no verification pending');
    }

    if (user.emailToken !== tokenHash) {
        throw error(400, 'invalid token');
    }

    if (user.emailTokenExpires < new Date()) {
        throw error(400, 'token expired');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            emailToken: null,
            emailTokenExpires: null
        }
    });

    throw redirect(303, '/login');
};
