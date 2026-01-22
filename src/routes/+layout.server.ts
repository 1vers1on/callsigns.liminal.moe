import type { PageServerLoad } from './$types';

import type { RequestEvent } from './$types';

export const load: PageServerLoad = async ({ cookies }: RequestEvent) => {
    const refreshToken = cookies.get('refreshToken');

    return {
        refreshToken
    };
};
