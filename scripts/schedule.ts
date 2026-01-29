import cron from 'node-cron';
import * as cleanup from './cleanup-unverified';

cron.schedule('0 */15 * * * *', () => {
    cleanup.main();
});

console.log('Scheduled tasks initialized.');


