const mongoose = require("mongoose");
const WalletCryptocurrency = require("./walletCryptocurrencyModel");

const walletSchema = new mongoose.Schema({
    usd_balance: { type: Number, default: 0 },
    user_id: { type: mongoose.Types.ObjectId, ref: "users" },
    created_at: { type: Date },
    updated_at: { type: Date },
    cryptos: [
        {
            symbol: { type: String, required: true },
            balance: { type: Number, default: 0 },
        },
    ],
});

const Wallet = mongoose.model("wallets", walletSchema);

Wallet.prototype.getWalletCryptocurrency = async function () {
    const wallet = await WalletCryptocurrency.find({ wallet_id: this._id });
    return wallet;
};

module.exports = Wallet;
