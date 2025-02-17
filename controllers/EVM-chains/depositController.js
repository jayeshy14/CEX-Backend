const { handleSweep } = require("../../utils/EVM-chains/sweep/handleSweep");
const { findUserByDepositAddress } = require("../../utils/findUserByDepositAddress");
const { getMainExchangeWallet } = require("../../utils/EVM-chains/generateEvmAddress");

exports.handleEvmDeposit = async (req, res) => {
    try {
        const { address, value, contractAddress, network } = req.body.event;

        console.log(`🔔 EVM Deposit Detected: ${value} on ${address} (${network})`);

        // Fetch the user linked to this deposit address
        const user = await findUserByDepositAddress(address);
        if (!user) {
            console.warn("⚠️ Unknown deposit address:", address);
            return res.status(400).json({ error: "Unknown address" });
        }
        // Sweep funds to main exchange wallet
        await handleSweep(network, address, contractAddress, getMainExchangeWallet(network));

        // Update user's balance
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("🚨 EVM Deposit Handler Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
