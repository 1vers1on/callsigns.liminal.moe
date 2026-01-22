import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { getUserFromAccessToken } from '$lib/server/auth';

export const load = async ({ cookies, url }) => {
    const accessToken = cookies.get('accessToken');
    if (!accessToken) throw redirect(303, '/login');

    const user = await getUserFromAccessToken(accessToken);
    if (!user) throw redirect(303, '/login');

    const query = url.searchParams.get('q')?.toUpperCase() || '';

    const qsos = await prisma.qSO.findMany({
        where: {
            userId: user.id,
            OR: [
                { contactCallsign: { contains: query } },
                { mode: { contains: query } },
                { band: { contains: query } },
                { notes: { contains: query } }
            ]
        },
        orderBy: { timestamp: 'desc' }
    });

    return {
        qsos: JSON.parse(JSON.stringify(qsos)),
        searchQuery: query
    };
};