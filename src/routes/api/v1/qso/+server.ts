import { json, error } from '@sveltejs/kit';
import { getUserFromAccessToken, verifyHttpAuthorizationHeader } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';

async function authenticateRequest(request: Request) {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
        throw error(401, 'Unauthorized');
    }

    const payload = await verifyHttpAuthorizationHeader(authorizationHeader);
    if (!payload?.valid || !payload.user) {
        throw error(401, 'Unauthorized');
    }

    return payload.user;
}

export async function GET({ url, request }) {
    const user = await authenticateRequest(request);

    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100); 
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    const contactCallsign = url.searchParams.get('contactCallsign');
    const mode = url.searchParams.get('mode');
    const band = url.searchParams.get('band');
    const targetUserId = url.searchParams.get('userId');

    const queryUserId = targetUserId ? parseInt(targetUserId) : user.id;
    const isOwner = queryUserId === user.id;

    const where: any = {
        userId: queryUserId,
    };

    if (!isOwner) {
        where.private = false;
    }

    if (contactCallsign) {
        where.contactCallsign = { contains: contactCallsign.toUpperCase() };
    }
    
    if (mode) where.mode = mode;
    if (band) where.band = band;

    try {
        const qsos = await prisma.qSO.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: limit,
            skip: offset,
            include: {
                callsign: {
                    select: { callsign: true, operatorName: true }
                }
            }
        });

        const total = await prisma.qSO.count({ where });

        return json({ qsos, total, limit, offset });
    } catch (err) {
        console.error('Error fetching QSOs:', err);
        throw error(500, 'Failed to fetch logbook');
    }
}

export async function POST({ request }) {
    const user = await authenticateRequest(request);
    const body = await request.json();

    if (!body?.contactCallsign) {
        throw error(400, 'Missing contactCallsign');
    }

    const callsignRecord = await prisma.callsign.findFirst({ 
        where: { userId: user.id } 
    });
    
    if (!callsignRecord) {
        throw error(400, 'User has no callsign attached');
    }

    try {
        const created = await prisma.qSO.create({
            data: {
                userId: user.id,
                timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
                callsignId: callsignRecord.id,
                contactCallsign: (body.contactCallsign || '').toUpperCase(),
                contactGrid: body.contactGrid || null,
                mode: body.mode || null,
                frequency: body.frequency != null ? Number(body.frequency) : null,
                band: body.band || null,
                rstSent: body.rstSent || null,
                rstReceived: body.rstReceived || null,
                qslSent: !!body.qslSent,
                qslReceived: !!body.qslReceived,
                notes: body.notes || null
            }
        });

        return json({ success: true, qso: created });
    } catch (err) {
        console.error('Error creating QSO:', err);
        throw error(500, 'Failed to create QSO');
    }
}

export async function PUT({ request }) {
    const user = await authenticateRequest(request);
    const body = await request.json();

    if (body?.id === undefined || body?.id === null) {
        throw error(400, 'Missing QSO id');
    }
    
    if (!body?.contactCallsign) {
        throw error(400, 'Missing contactCallsign');
    }

    const qsoId = Number(body.id);
    if (!Number.isInteger(qsoId)) {
        throw error(400, 'Invalid QSO id');
    }

    const existing = await prisma.qSO.findFirst({
        where: { id: qsoId, userId: user.id }
    });
    
    if (!existing) {
        throw error(404, 'QSO not found');
    }

    try {
        const updated = await prisma.qSO.update({
            where: { id: qsoId },
            data: {
                timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
                contactCallsign: body.contactCallsign.toUpperCase(),
                contactGrid: body.contactGrid ?? null,
                mode: body.mode ?? null,
                frequency: body.frequency != null ? Number(body.frequency) : null,
                band: body.band ?? null,
                rstSent: body.rstSent ?? null,
                rstReceived: body.rstReceived ?? null,
                qslSent: !!body.qslSent,
                qslReceived: !!body.qslReceived,
                notes: body.notes ?? null
            }
        });

        return json({ success: true, qso: updated });
    } catch (err) {
        console.error('Error updating QSO:', err);
        throw error(500, 'Failed to update QSO');
    }
}

export async function DELETE({ request }) {
    const user = await authenticateRequest(request);
    const body = await request.json();

    if (body?.id === undefined || body?.id === null) {
        throw error(400, 'Missing QSO id');
    }

    const qsoId = Number(body.id);
    if (!Number.isInteger(qsoId)) {
        throw error(400, 'Invalid QSO id');
    }

    const existing = await prisma.qSO.findFirst({
        where: { id: qsoId, userId: user.id }
    });
    
    if (!existing) {
        throw error(404, 'QSO not found');
    }

    try {
        await prisma.qSO.delete({
            where: { id: qsoId }
        });

        return json({ success: true });
    } catch (err) {
        console.error('Error deleting QSO:', err);
        throw error(500, 'Failed to delete QSO');
    }
}

export async function PATCH({ request }) {
    try {
        const user = await authenticateRequest(request);
        const body = await request.json();

        if (body?.id === undefined || body?.id === null) {
            throw error(400, 'Missing QSO id');
        }

        const qsoId = Number(body.id);
        if (!Number.isInteger(qsoId)) {
            throw error(400, 'Invalid QSO id');
        }

        const existing = await prisma.qSO.findFirst({
            where: { id: qsoId, userId: user.id }
        });

        if (!existing) {
            throw error(404, 'QSO not found');
        }

        let updateData: any = {};

        if (body.timestamp !== undefined) {
            updateData.timestamp = body.timestamp ? new Date(body.timestamp) : null;
        }

        if (body.contactCallsign !== undefined && body.contactCallsign !== '') {
            updateData.contactCallsign = body.contactCallsign.toUpperCase();
        }

        if (body.contactGrid !== undefined) {
            updateData.contactGrid = body.contactGrid || null;
        }

        if (body.mode !== undefined) {
            updateData.mode = body.mode || null;
        }

        if (body.frequency !== undefined) {
            updateData.frequency = body.frequency != null ? Number(body.frequency) : null;
        }

        if (body.band !== undefined) {
            updateData.band = body.band || null;
        }

        if (body.rstSent !== undefined) {
            updateData.rstSent = body.rstSent || null;
        }

        if (body.rstReceived !== undefined) {
            updateData.rstReceived = body.rstReceived || null;
        }

        if (body.qslSent !== undefined) {
            updateData.qslSent = !!body.qslSent;
        }

        if (body.qslReceived !== undefined) {
            updateData.qslReceived = !!body.qslReceived;
        }

        if (body.notes !== undefined) {
            updateData.notes = body.notes || null;
        }

        if (Object.keys(updateData).length === 0) {
            return json({ success: true, qso: existing });
        }

        const updated = await prisma.qSO.update({
            where: { id: qsoId },
            data: updateData
        });

        return json({ success: true, qso: updated });
    } catch (err) {
        if (typeof err === 'object' && err !== null && 'status' in err) {
            throw err;
        }

        console.error('Error patching QSO:', err);
        throw error(500, 'Failed to patch QSO');
    }
}
