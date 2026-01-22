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
        const turnstileToken = data.get('cf-turnstile-response') as string;

        if (!turnstileToken) {
            return fail(400, { error: 'Please complete the CAPTCHA', email, callsign });
        }

        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: process.env.CF_TURNSTILE_SECRET!,
                response: turnstileToken
            })
        });

        const verifyJson = await verifyRes.json();

        if (!verifyJson.success) {
            return fail(400, { error: 'CAPTCHA verification failed', email, callsign });
        }

        if (password !== confirmPassword) {
            return fail(400, { error: 'Passwords do not match', email, callsign });
        }

        console.log('Registering user:', { email, callsign });

        await register(email, password, callsign);

        throw redirect(302, '/verifyNotice');
    }
};
