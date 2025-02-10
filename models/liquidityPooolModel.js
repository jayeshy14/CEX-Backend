const mongoose = require("mongoose");

const contributorSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: "users", required: true },
    amountA: { type: Number, default: 0 },
    amountB: { type: Number, default: 0 },
});

const liquidityPoolSchema = new mongoose.Schema({
    tokenA_id: { type: mongoose.Types.ObjectId, ref: "cryptocurrencies", required: true },
    tokenB_id: { type: mongoose.Types.ObjectId, ref: "cryptocurrencies", required: true },
    reserveA: { type: Number, default: 0 },
    reserveB: { type: Number, default: 0 },
    contributors: [contributorSchema], 
    created_at: { type: Date, default: Date.now },
});

const LiquidityPool = mongoose.model("LiquidityPool", liquidityPoolSchema);
module.exports = LiquidityPool;
