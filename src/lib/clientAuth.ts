import { getAccessToken, setAccessToken } from './storage.svelte';

export async function refreshAccessToken(): Promise<void> {
    const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    console.log('Refreshed access token:', data.token);
    setAccessToken(data.token);
}

export async function logout(): Promise<void> {
    const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to logout');
    }

    setAccessToken(null);
}

export async function loggedIn(): Promise<boolean> {
    const token = await getAccessToken();
    return token !== null && token !== undefined;
}
