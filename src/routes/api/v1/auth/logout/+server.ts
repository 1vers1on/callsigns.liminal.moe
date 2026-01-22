import { json } from '@sveltejs/kit';
import { logout } from '$lib/server/auth';

export async function POST({ cookies }) {
    const refreshToken = cookies.get('refreshToken');

    if (refreshToken) {
        try {
            await logout(refreshToken);
        } catch (err) {
            console.error('Logout database error:', err);
        }
    }

    cookies.delete('refreshToken', {
        path: '/',
        secure: process.env.NODE_ENV === 'production'
    });
    cookies.delete('accessToken', {
        path: '/',
        secure: process.env.NODE_ENV === 'production'
    });

    return json({ success: true });
}
