const User = require("../models/userModel");
const Chain = require("../models/chainModel");
const Cryptocurrency = require("../models/cryptocurrencyModel");
const Wallet = require("../models/walletModel");

const { withdrawEVM } = require("../utils/EVM-chains/withdrawEvm");
const { withdrawSolana } = require("../utils/Solana/withdrawSolana");
const { withdrawBTC } = require("../utils/BTC/withdrawBTC");

exports.handleWithdrawal = async (req, res) => {
    try {
        const { userId, address, amount, selectedCrypto, selectedChain } = req.body;

        if (!userId || !selectedCrypto || !selectedChain || !address || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const crypto = await Cryptocurrency.findOne({ name: selectedCrypto.toUpperCase() });
        if (!crypto) return res.status(404).json({ error: "Cryptocurrency not found" });

        const chain = await Chain.findOne({ name: selectedChain.toUpperCase() });
        if (!chain) return res.status(404).json({ error: "Chain not found" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const wallet = await Wallet.findOne({ user_id: userId });
        if (!wallet) return res.status(404).json({ error: "Wallet not found" });

        const chainEntry = wallet.chains.find(c => c.chain.toString() === selectedChain);
        if (!chainEntry) return res.status(404).json({ error: "Chain not found in wallet" });

        const balance = chainEntry.balances[crypto.symbol] || 0;
        if (balance < amount) return res.status(400).json({ error: "Insufficient balance" });

        switch (selectedChain.toUpperCase()) {
            case "ETHEREUM":
            case "BSC":
            case "POLYGON":
                await withdrawEVM(crypto, address, amount, chain);
                break;
            case "SOLANA":
                await withdrawSolana(crypto, address, amount);
                break;
            case "BITCOIN":
                await withdrawBTC(crypto, address, amount);
                break;
            default:
                return res.status(400).json({ error: "Unsupported chain" });
        }

        res.status(200).json({ success: true, message: "Withdrawal processed" });

    } catch (error) {
        console.error("🚨 Withdrawal Handler Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
