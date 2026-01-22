import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { OperatorProfile } from '$lib/types';
import { prisma } from '$lib/server/prisma';

const OPENCAGE_KEY = '39052460b04d4f28843dad2675d8f17f';

function latLonToGrid(lat: number, lon: number): string {
    const adjLat = lat + 90;
    const adjLon = lon + 180;

    const fieldLat = Math.floor(adjLat / 10);
    const fieldLon = Math.floor(adjLon / 20);
    
    const squareLat = Math.floor(adjLat % 10);
    const squareLon = Math.floor((adjLon / 2) % 10);

    const subLat = Math.floor((adjLat - (fieldLat * 10) - squareLat) * 24);
    const subLon = Math.floor((adjLon - (fieldLon * 20) - (squareLon * 2)) * 24);

    const A = 'ABCDEFGHIJKLMNOPQR';
    
    return (
        A[fieldLon] +
        A[fieldLat] +
        squareLon.toString() +
        squareLat.toString() +
        A[subLon].toLowerCase() +
        A[subLat].toLowerCase()
    );
}

export const load: PageServerLoad = async ({ params, fetch }) => {
    const callsign = params.slug;

    let record = await prisma.callsign.findUnique({ where: { callsign } });
    if (!record) throw error(404, 'Not found');

    if (!record.gridSquare) {
        const addressParts = [
            record.addressLine1,
            record.city,
            record.stateProvince,
            record.country
        ].filter(Boolean);

        if (addressParts.length > 0) {
            try {
                const query = encodeURIComponent(addressParts.join(', '));
                const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${OPENCAGE_KEY}&limit=1`;
                console.log('Geocoding URL:', url);
                
                const res = await fetch(url);
                const data = await res.json();

                if (data.results && data.results.length > 0) {
                    console.log('Geocoding data:', data);
                    const newGrid = data.results[0].annotations.Maidenhead.substring(0, 6);

                    record = await prisma.callsign.update({
                        where: { callsign },
                        data: { gridSquare: newGrid }
                    });
                }
            } catch (err) {
                console.error('Geocoding failed:', err);
            }
        }
    }

    const mapStatus = (s: typeof record.status) => {
        switch (s) {
            case 'ACTIVE': return 'Active';
            case 'EXPIRED': return 'Expired';
            case 'CANCELLED': return 'Cancelled';
            default: return 'Pending';
        }
    };

    const mapClass = (c: typeof record.licenseClass) => {
        switch (c) {
            case 'T': return 'Technician';
            case 'G': return 'General';
            case 'E': return 'Extra';
            default: return undefined;
        }
    };

    const operator: OperatorProfile = {
        callsign: record.callsign,
        name: record.operatorName ?? '',
        countryCode: record.country && record.country.length >= 2 
            ? record.country.substring(0, 2).toUpperCase() 
            : '',
        class: mapClass(record.licenseClass),
        status: mapStatus(record.status),
        joined: record.createdAt ? record.createdAt.toISOString().split('T')[0] : undefined,
        address: {
            city: record.city ?? undefined,
            country: record.country ?? '',
            state: record.stateProvince ?? undefined,
            zip: record.postalCode?.substring(0, 5) ?? undefined,
            street: record.addressLine1 ?? undefined,
            grid: record.gridSquare ?? undefined,
        },
        identifiers: {},
        nickname: undefined,
        birthday: undefined,
        gender: undefined,
        age: undefined,
        bio: undefined,
    };

    return { operator };
};