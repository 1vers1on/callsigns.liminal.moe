import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { getUserFromAccessToken } from '$lib/server/auth';

export const load = async ({ cookies, url }) => {
    const accessToken = cookies.get('accessToken');
    if (!accessToken) throw redirect(303, '/login');

    const user = await getUserFromAccessToken(accessToken);
    if (!user) throw redirect(303, '/login');

    const editId = url.searchParams.get('editId');
    let existingQso = null;

    if (editId) {
        existingQso = await prisma.qSO.findUnique({
            where: { id: Number(editId) }
        });
        if (!existingQso || existingQso.userId !== user.id) {
            throw error(404, 'QSO not found');
        }

        if (existingQso.timestamp) {
            (existingQso as any).timestamp = existingQso.timestamp.toISOString().slice(0, 16);
        }
    }

    return {
        existingQso: existingQso ? JSON.parse(JSON.stringify(existingQso)) : null
    };
};
