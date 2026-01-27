import cron from 'node-cron';
import * as fcc from './loadFCC';
import * as cleanup from './cleanup-unverified';

cron.schedule('0 0 0 * * *', () => {
    fcc.main();
});

cron.schedule('0 */15 * * * *', () => {
    cleanup.main();
});

console.log('Scheduled tasks initialized.');


