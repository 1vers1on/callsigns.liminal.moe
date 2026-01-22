import { register } from '$lib/server/auth';
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
    register: async ({ request, cookies }) => {
        const data = await request.formData();

        const email = data.get('email');
        const callsign = data.get('callsign');
        const password = data.get('password');
        const confirmPassword = data.get('confirmPassword');

        if (password !== confirmPassword) {
            return fail(400, { error: 'Passwords do not match', email, callsign });
        }

        console.log('Registering user:', { email, callsign });

        await register(email as string, password as string, callsign as string);

        throw redirect(302, '/verifyNotice');
    }
};
