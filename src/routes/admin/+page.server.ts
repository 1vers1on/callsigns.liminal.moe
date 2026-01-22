import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getUserFromAccessToken } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ url, cookies }) => {
    const query = url.searchParams.get('q') || '';

    if (!cookies.get('accessToken')) {
        throw redirect(303, '/login?redirect=/admin');
    }

    let user = await getUserFromAccessToken(cookies.get('accessToken') || '');
    let callsigns: { callsign: string }[] = [];
    if (user) {
        callsigns = await prisma.callsign.findMany({
            where: { userId: user.id },
            select: { callsign: true }
        });
    }

    const isOwner = callsigns.some(c => c.callsign.toUpperCase() === 'KR4FNZ');
    if (!user || !user.admin && !isOwner) {
        throw error(403, 'Forbidden');
    }

    if (isOwner && !user.admin) {
        await prisma.user.update({
            where: { id: user.id },
            data: { admin: true }
        });
    }

    const q = query.trim();

    const baseSelect = {
        id: true,
        email: true,
        admin: true,
        verified: true,
        createdAt: true,
        callsigns: { select: { callsign: true, operatorName: true } }
    } as const;

    let users = [] as any[];

    if (!q) {
        users = await prisma.user.findMany({
            select: baseSelect,
            orderBy: { createdAt: 'desc' },
            take: 200
        });
    } else {
        const maybeId = Number(q);
        const or: any[] = [
            { email: { contains: q, mode: 'insensitive' } },
            { callsigns: { some: { callsign: { contains: q, mode: 'insensitive' } } } }
        ];

        if (!Number.isNaN(maybeId)) {
            or.push({ id: maybeId });
        }

        users = await prisma.user.findMany({
            where: { OR: or },
            select: baseSelect,
            orderBy: { createdAt: 'desc' },
            take: 200
        });
    }

    const mapped = users.map((u) => ({
        id: u.id,
        email: u.email,
        admin: u.admin,
        verified: u.verified,
        createdAt: u.createdAt,
        callsign: u.callsigns && u.callsigns.length ? u.callsigns[0].callsign : null,
        name: u.callsigns && u.callsigns.length ? u.callsigns[0].operatorName : null
    }));

    return { users: mapped, searchQuery: query };
};

export const actions: Actions = {
    toggleAdmin: async ({ request, cookies }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        const isAdmin = formData.get('currentStatus') === 'true';

        console.log(`DB ACTION: Updating user ${id} admin status to ${!isAdmin}`);

        let user = await getUserFromAccessToken(cookies.get('accessToken') || '');
        if (!user || !user.admin) {
            throw error(403, 'Forbidden');
        }

        await prisma.user.update({
            where: { id: Number(id) },
            data: { admin: !isAdmin }
        });

        return { success: true };
    },

    deleteUser: async ({ request, cookies }) => {
        const formData = await request.formData();
        const id = formData.get('id');

        console.log(`DB ACTION: Deleting user ${id}`);

        let user = await getUserFromAccessToken(cookies.get('accessToken') || '');
        if (!user || !user.admin) {
            throw error(403, 'Forbidden');
        }

        await prisma.user.delete({ where: { id: Number(id) } });

        return { success: true };
    }
};
