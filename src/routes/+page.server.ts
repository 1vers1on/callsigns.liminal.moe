import { getSolarData } from '$lib/server/solarData';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const solar = getSolarData();

    return {
        solar
    };
};
