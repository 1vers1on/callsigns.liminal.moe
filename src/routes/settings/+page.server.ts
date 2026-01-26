import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import * as auth from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
    const token = cookies.get('accessToken');

    if (!token) {
        throw redirect(302, '/login');
    }

    try {
        const user = await auth.getUserFromAccessToken(token);
        const apiKeys = await auth.listApiKeys(user.id);

        return {
            user,
            apiKeys: apiKeys
        };
    } catch (e) {
        cookies.delete('accessToken', { path: '/' });
        cookies.delete('refreshToken', { path: '/' });
        throw redirect(302, '/login');
    }
};

export const actions: Actions = {
    create: async ({ request, cookies }) => {
        const token = cookies.get('accessToken');

        if (!token) {
            throw redirect(302, '/login');
        }

        let user;
        try {
            user = await auth.getUserFromAccessToken(token);
        } catch (e) {
            return fail(401, { error: 'Unauthorized' });
        }

        const data = await request.formData();
        const label = data.get('label') as string;

        if (!label || label.trim().length === 0) {
            return fail(400, { error: 'Label is required' });
        }

        try {
            const newSecret = await auth.issueApiKey(user.id, label);

            return { success: true, newSecret };
        } catch (err) {
            console.error('Error creating API key:', err);
            return fail(500, { error: 'Failed to create API key' });
        }
    },

    delete: async ({ request, cookies }) => {
        const token = cookies.get('accessToken');

        if (!token) {
            throw redirect(302, '/login');
        }

        let user;
        try {
            user = await auth.getUserFromAccessToken(token);
        } catch (e) {
            return fail(401, { error: 'Unauthorized' });
        }

        const data = await request.formData();
        const idString = data.get('id');

        if (!idString) {
            return fail(400, { error: 'ID is required' });
        }

        const id = Number(idString);

        try {
            await auth.revokeApiKey(user.id, id);
            return { success: true };
        } catch (err) {
            console.error('Error deleting API key:', err);
            return fail(500, { error: 'Failed to delete API key' });
        }
    }
};