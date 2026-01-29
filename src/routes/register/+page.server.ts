import { register } from '$lib/server/auth';
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
    register: async ({ request }) => {
        const data = await request.formData();

        const email = data.get('email') as string;
        const callsign = data.get('callsign') as string;
        const password = data.get('password') as string;
        const confirmPassword = data.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            return fail(400, { error: 'Passwords do not match', email, callsign });
        }

        console.log('Registering user:', { email, callsign });

        await register(email, password, callsign);

        throw redirect(302, '/verifyNotice');
    }
};
