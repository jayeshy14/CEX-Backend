const mongoose = require("mongoose");

const chainSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true }, // e.g., Ethereum, BSC, Polygon
    symbol: { type: String, required: true }, // Native gas token symbol (e.g., ETH, BNB, MATIC)
    chain_id: { type: Number, required: true }, // Chain ID (e.g., Ethereum: 1, BSC: 56)
    native_token: { type: String, required: true }, // e.g., ETH for Ethereum
    exchange_wallet_address: { type: String, required: true }, // Exchange's main wallet for this chain
    rpcUrl: { type: String, required: true }, // RPC URL for blockchain interactions
    explorerUrl: { type: String, required: true }, // Blockchain explorer URL (e.g., etherscan.io)
    tokens: [{
        symbol: { type: String, required: true }, // e.g., USDT
        name: { type: String, required: true }, // e.g., Tether USD
        contract_address: { type: String, required: true }, // ERC-20 contract address
        decimals: { type: Number, required: true, default: 18 }
    }],
    deposit_addresses: [{ type: String, required: true }]
}, { timestamps: true });

const Chain = mongoose.model("chains", chainSchema);
module.exports = Chain;

