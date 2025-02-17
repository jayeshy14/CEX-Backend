const { handleSweep } = require("../../utils/Solana/sweep/handleSweep");
const { findUserByDepositAddress } = require("../../utils/findUserByDepositAddress");
const { getMainExchangeWallet } = require("../../utils/Solana/generateSolanaAddress");
const { PublicKey } = require("@solana/web3.js");

exports.handleSolanaDeposit = async (req, res) => {
    try {
        const { address, value, contractAddress, network } = req.body.event;

        console.log(`🔔 Solana Deposit Detected: ${value} on ${address} (${network})`);

        // Validate the deposit address
        const depositPubkey = new PublicKey(address);

        // Fetch the user linked to this deposit address
        const user = await findUserByDepositAddress(depositPubkey.toBase58());
        if (!user) {
            console.warn("⚠️ Unknown deposit address:", address);
            return res.status(400).json({ error: "Unknown address" });
        }

        // Sweep funds to main exchange wallet
        await handleSweep(network, depositPubkey, contractAddress, getMainExchangeWallet(network));

        // Update user's balance
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("🚨 Solana Deposit Handler Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
