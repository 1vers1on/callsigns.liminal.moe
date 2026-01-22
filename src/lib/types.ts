export interface OperatorProfile {
    callsign: string;
    name: string;
    countryCode: string;
    class?: string;
    status?: 'Active' | 'Expired' | 'Cancelled' | 'Pending';
    joined?: string;
    expires?: string;
    address?: {
        city?: string;
        state?: string;
        country: string;
        zip?: string;
        street?: string;
        grid?: string;
    };
    identifiers?: {
        dmrId?: string;
        frn?: string;
        itvId?: string;
        licenseNum?: string;
    };

    nickname?: string;
    birthday?: string;
    gender?: string;
    age?: number;
    bio?: string;
}
