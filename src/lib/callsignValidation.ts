function validateHamCallsign(callsign: string): boolean {
    // TODO: Check prefixes against a known list of valid callsign prefixes
    const clean = callsign.trim().toUpperCase();

    if (clean.length < 3 || clean.length > 7) {
        return false;
    }

    const hamRegex = /^[A-Z2-9][0-9A-Z]?[0-9][A-Z]{1,4}$/;

    return hamRegex.test(clean);
}

export { validateHamCallsign };
