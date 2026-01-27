// src/routes/api/v1/callsign/[callsign]/+server.ts
import { json, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import jwt from 'jsonwebtoken';
import type { OperatorProfile } from '$lib/types';

function mapStatusToDb(status?: string) {
    switch (status?.toLowerCase()) {
        case 'active': return 'ACTIVE';
        case 'expired': return 'EXPIRED';
        case 'cancelled': return 'CANCELLED';
        case 'suspended': return 'SUSPENDED';
        case 'revoked': return 'REVOKED';
        default: return 'ACTIVE';
    }
}

function mapClassToDb(className?: string): string | null {
    switch (className?.toLowerCase()) {
        case 'technician': return 'T';
        case 'general': return 'G';
        case 'extra': return 'E';
        case 'novice': return 'N';
        case 'advanced': return 'A';
        default: return className || null;
    }
}

export async function PUT({ params, request, cookies }) {
    const callsign = params.slug;
    const token = cookies.get('accessToken');

    if (!token) {
        throw error(401, 'Unauthorized');
    }

    const decoded = jwt.decode(token) as { callsign?: string } | null;
    const userCallsign = decoded?.callsign;

    if (!userCallsign || userCallsign.toLowerCase() !== callsign.toLowerCase()) {
        throw error(403, 'Forbidden: You can only edit your own profile');
    }

    try {
        const body = await request.json() as OperatorProfile;

        console.log(`[API] Updating callsign: ${callsign}`, body);

        const existingRecord = await prisma.callsign.findUnique({
            where: { callsign }
        });

        if (!existingRecord) {
            throw error(404, 'Callsign record not found');
        }

        const updatedCallsign = await prisma.callsign.update({
            where: { callsign },
            data: {
                operatorName: body.name,
                status: mapStatusToDb(body.status),
                licenseClass: mapClassToDb(body.class),
                
                addressLine1: body.address?.street,
                city: body.address?.city,
                stateProvince: body.address?.state,
                postalCode: body.address?.zip,
                country: body.address?.country,
                gridSquare: body.address?.grid,

                // -- Missing Schema Fields (Add these to your schema.prisma!) --
                // nickname: body.nickname,
                // bio: body.bio,
                // birthday: body.birthday ? new Date(body.birthday) : null,
                // gender: body.gender,
            }
        });

        return json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedCallsign
        });

    } catch (err) {
        console.error('[API] Update error:', err);
        
        // @ts-ignore
        if (err.status) throw err;
        
        throw error(500, 'Internal Server Error');
    }
};
