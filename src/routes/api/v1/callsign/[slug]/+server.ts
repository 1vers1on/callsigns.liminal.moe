import { json, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import jwt from 'jsonwebtoken';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import sharp from 'sharp';
import type { OperatorProfile } from '$lib/types';

const R2 = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!
    }
});

async function uploadToR2(base64Data: string, callsign: string): Promise<string | null> {
    try {
        const matches = base64Data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return null;

        const rawBuffer = Buffer.from(matches[2], 'base64');

        const processedBuffer = await sharp(rawBuffer)
            .resize({ 
                width: 512, 
                height: 512, 
                fit: 'cover',
                position: 'center' 
            })
            .webp({ quality: 80 })
            .toBuffer();

        const key = `avatars/${callsign.toLowerCase()}_${Date.now()}.webp`;

        const command = new PutObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
            Body: processedBuffer,
            ContentType: 'image/webp'
        });

        await R2.send(command);

        return `${env.R2_PUBLIC_URL}/${key}`;
    } catch (err) {
        console.error('Image Processing/Upload Error:', err);
        return null;
    }
}

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

    if (!token) throw error(401, 'Unauthorized');

    const decoded = jwt.decode(token) as { callsign?: string } | null;
    const userCallsign = decoded?.callsign;

    if (!userCallsign || userCallsign.toLowerCase() !== callsign.toLowerCase()) {
        throw error(403, 'Forbidden');
    }

    try {
        const body = await request.json() as OperatorProfile;
        
        const existingRecord = await prisma.callsign.findUnique({
            where: { callsign }
        });

        if (!existingRecord) throw error(404, 'Not found');

        let avatarUrlToSave = existingRecord.avatarUrl;

        if (body.avatarUrl && body.avatarUrl.startsWith('data:image')) {
            console.log(`[API] Processing & uploading avatar for ${callsign}...`);
            const publicUrl = await uploadToR2(body.avatarUrl, callsign);
            
            if (publicUrl) {
                avatarUrlToSave = publicUrl;
            }
        }

        const updated = await prisma.callsign.update({
            where: { callsign },
            data: {
                operatorName: body.name,
                status: mapStatusToDb(body.status),
                licenseClass: mapClassToDb(body.class),
                avatarUrl: avatarUrlToSave,
                
                addressLine1: body.address?.street,
                city: body.address?.city,
                stateProvince: body.address?.state,
                postalCode: body.address?.zip,
                country: body.address?.country,
                gridSquare: body.address?.grid,

                nickname: body.nickname,
                bio: body.bio,
                birthday: body.birthday ? new Date(body.birthday) : null,
                gender: body.gender,
            }
        });

        return json({ success: true, data: updated });

    } catch (err) {
        console.error('[API] Error:', err);
        // @ts-ignore
        if (err.status) throw err;
        throw error(500, 'Internal Server Error');
    }
}
