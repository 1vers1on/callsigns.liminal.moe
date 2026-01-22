export type BandCondition = {
    band: string;
    day: string;
    night: string;
};

export type SolarData = {
    sfi: number;
    sn: number;
    aIndex: number;
    kIndex: number;
    updated: string;
    status: string;
    conditions: BandCondition[];
};

let currentSolarData: SolarData = {
    sfi: 0,
    sn: 0,
    aIndex: 0,
    kIndex: 0,
    updated: 'Not yet fetched',
    status: 'Unknown',
    conditions: []
};

function parseHamQSLXml(xml: string): SolarData {
    const getTagValue = (tag: string, text: string) => {
        const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    };

    const sfi = parseInt(getTagValue('solarflux', xml)) || 0;
    const sn = parseInt(getTagValue('sunspots', xml)) || 0;
    const aIndex = parseInt(getTagValue('aindex', xml)) || 0;
    const kIndex = parseInt(getTagValue('kindex', xml)) || 0;
    const updated = getTagValue('updated', xml);
    const signalNoise = getTagValue('signalnoise', xml);

    const bandsMap: Record<string, { day: string; night: string }> = {};
    const bandRegex = /<band name="([^"]+)" time="([^"]+)">([^<]+)<\/band>/g;

    let match;
    while ((match = bandRegex.exec(xml)) !== null) {
        const [, name, time, value] = match;

        if (!bandsMap[name]) {
            bandsMap[name] = { day: 'Unknown', night: 'Unknown' };
        }

        if (time.toLowerCase() === 'day') bandsMap[name].day = value;
        if (time.toLowerCase() === 'night') bandsMap[name].night = value;
    }

    const conditions: BandCondition[] = Object.keys(bandsMap).map((bandName) => ({
        band: bandName,
        day: bandsMap[bandName].day,
        night: bandsMap[bandName].night
    }));

    return {
        sfi,
        sn,
        aIndex,
        kIndex,
        updated,
        status: signalNoise || 'Active',
        conditions
    };
}

async function fetchFromSource(): Promise<SolarData> {
    console.log('Fetching live solar data from HamQSL (N0NBH)...');

    try {
        const response = await fetch('https://www.hamqsl.com/solarxml.php');

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const xmlText = await response.text();
        return parseHamQSLXml(xmlText);
    } catch (error) {
        console.error('Error fetching HamQSL data:', error);
        throw error;
    }
}

export async function updateSolarData() {
    try {
        const newData = await fetchFromSource();
        currentSolarData = newData;
        console.log(
            `Solar data updated: SFI=${newData.sfi} K=${newData.kIndex} Conditions=${newData.conditions.length} bands`
        );
    } catch (err) {
        console.error('Failed to update solar data:', err);
    }
}

export function getSolarData() {
    return currentSolarData;
}

let intervalId: NodeJS.Timeout | null = null;

export function startBackgroundUpdate(intervalMinutes: number = 60) {
    if (intervalId) return;

    updateSolarData();

    intervalId = setInterval(
        () => {
            updateSolarData();
        },
        intervalMinutes * 60 * 1000
    );

    console.log(`Solar data background poller started (${intervalMinutes}m interval)`);
}
