import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import type { OperatorProfile } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
    return {
        operator: {
            callsign: params.slug,
            name: 'Elizabeth Bennet',
            nickname: 'Lizzy',
            gender: 'Female',
            birthday: '1992-05-20',
            age: 33,
            countryCode: 'GB',
            class: 'Full',
            status: 'Active',
            joined: '2018-03-15',
            address: {
                city: 'Bath',
                country: 'United Kingdom',
                grid: 'IO81wv'
            },
            identifiers: {
                dmrId: '2351234'
            },
            bio: 'Enthusiastic amateur radio operator and community volunteer.'
        } as OperatorProfile
    };
    error(404, 'Not found');
};
