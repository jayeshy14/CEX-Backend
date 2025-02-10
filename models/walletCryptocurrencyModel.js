//walletCryptocurrencyModel.js
const mongoose = require('mongoose');

const walletCryptocurrencySchema = new mongoose.Schema({
  	cryptocurrency_amount: { type: Number },
	wallet_id: { type: mongoose.Types.ObjectId, ref: 'wallets' },
	cryptocurrency_id: { type: mongoose.Types.ObjectId, ref: 'cryptocurrencies' },
});

const WalletCryptocurrency = mongoose.model('walletCryptocurrencies', walletCryptocurrencySchema);
module.exports = WalletCryptocurrency;