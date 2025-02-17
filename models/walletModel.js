const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", unique: true, required: true },
    usd_balance: { type: Number, default: 0 },
    balances: { type: Map, of: Number, default: {} },
    chains: [{
        chain: { type: mongoose.Schema.Types.ObjectId, ref: "chains", required: true }, 
        address: { type: String, required: true }, 
    }]
}, { timestamps: true });

const Wallet = mongoose.model("wallets", walletSchema);
module.exports = Wallet;
