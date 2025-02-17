const { handleSweep } = require("../../utils/BTC/sweep/handleSweep");
const { findUserByDepositAddress } = require("../../utils/findUserByDepositAddress");
const { getMainExchangeWallet } = require("../../utils/BTC/generateBtcAddress");
exports.handleBitcoinDeposit = async (req, res) => {
    try {
        const { address, value, network } = req.body.event;

        console.log(`🔔 Bitcoin Deposit Detected: ${value} BTC on ${address} (${network})`);

        // Fetch the user linked to this deposit address
        const user = await findUserByDepositAddress(address);
        if (!user) {
            console.warn("⚠️ Unknown deposit address:", address);
            return res.status(400).json({ error: "Unknown address" });
        }

        // Sweep funds to main exchange wallet
        await handleSweep(network, address, getMainExchangeWallet(network));

        // Update user's balance
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("🚨 Bitcoin Deposit Handler Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
