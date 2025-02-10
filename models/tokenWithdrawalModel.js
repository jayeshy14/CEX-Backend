const { status } = require("express/lib/response");
const mongoose = require("mongoose");

const tokenWithdrawalSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: "users" },
    to_address: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    tx_hash: { type: String},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const TokenWithdrawal = mongoose.model("token_withdrawals", tokenWithdrawalSchema);

module.exports = TokenWithdrawal;