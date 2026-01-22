export function gridToLatLng(grid: string): [number, number] {
    grid = grid.toUpperCase();

    const lon0 = (grid.charCodeAt(0) - 65) * 20 - 180;
    const lat0 = (grid.charCodeAt(1) - 65) * 10 - 90;

    const lon1 = grid.length > 2 ? (grid.charCodeAt(2) - 48) * 2 : 0;
    const lat1 = grid.length > 3 ? (grid.charCodeAt(3) - 48) : 0;

    const lon2 = grid.length > 4 ? (grid.charCodeAt(4) - 65 + 0.5) / 12 : 0;
    const lat2 = grid.length > 5 ? (grid.charCodeAt(5) - 65 + 0.5) / 24 : 0;

    const lon = lon0 + lon1 + lon2;
    const lat = lat0 + lat1 + lat2;

    return [lat, lon];
}


export function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    
    return {
        km: distanceKm,
        miles: distanceKm * 0.621371,
        bearing: (Math.atan2(Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180)), 
                  Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) - 
                  Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon)) * 180 / Math.PI + 360) % 360
    };
}