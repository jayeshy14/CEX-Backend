const cron = require("node-cron");
const { sweepDepositsToMainWallet } = require("../services/sweepDeposits");

// Run every 10 minutes
cron.schedule("*/10 * * * *", async () => {
    console.log("Running deposit sweep process...");
    await sweepDepositsToMainWallet();
});

module.exports = scheduleSweeps;