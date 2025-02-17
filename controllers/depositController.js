const Wallet = require("../models/walletModel");
const { getEVMAddress } = require("../utils/EVM-chains/generateEvmAddress");
const { getSolanaAddress } = require("../utils/Solana/generateSolanaAddress");
const { getBTCAddress } = require("../utils/BTC/generateBtcAddress");

/**
 * Generates or retrieves a deposit address for a user on a specific blockchain.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response object with "depositAddress"
 */
exports.getOrGenerateDepositAddress = async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const { userId, selectedCrypto, selectedChain } = req.body;

        if (!userId || !selectedCrypto || !selectedChain) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log("Parsed values:", { userId, selectedCrypto, selectedChain });

        // Fetch wallet
        let wallet = await Wallet.findOne({ user_id: userId });

        // Initialize wallet if not found
        if (!wallet) {
            wallet = new Wallet({ user_id: userId, chains: [] });
        }

        let depositAddress = null;

        // Check if deposit address already exists
        const chainEntry = wallet.chains.find(chain => chain.chain.toString() === selectedChain);
        if (chainEntry) {
            depositAddress = chainEntry.address;
        }

        console.log("Chain after parsing:", selectedChain);

        if (!depositAddress) {
            switch (selectedChain.toUpperCase()) {
                case "ETHEREUM":
                case "BSC":
                    depositAddress = getEVMAddress(userId, selectedChain);
                    break;
                case "SOLANA":
                    depositAddress = getSolanaAddress(userId, selectedChain);
                    break;
                case "BITCOIN":
                    depositAddress = getBTCAddress(userId, selectedChain);
                    break;
                default:
                    return res.status(400).json({ error: "Unsupported blockchain" });
            }

            // Save new deposit address to wallet
            wallet.chains.push({ chain: selectedChain, address: depositAddress, balances: {} });
            await wallet.save();
        }

        return res.json({ depositAddress });
    } catch (error) {
        console.error("Error generating deposit address:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
