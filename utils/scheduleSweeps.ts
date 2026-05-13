import { sweepDepositsToMainWallet } from '../services/sweepDeposits';

let intervalHandle: NodeJS.Timeout | null = null;

export const scheduleSweeps = (): void => {
  if (intervalHandle) return;
  // Run every 10 minutes
  intervalHandle = setInterval(() => {
    console.log('Running deposit sweep process...');
    void sweepDepositsToMainWallet();
  }, 10 * 60 * 1000);
};

export default scheduleSweeps;
