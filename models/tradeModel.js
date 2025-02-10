// //tradeModel.js
// const mongoose = require('mongoose');
// const Cryptocurrency = require('./cryptocurrencyModel');

// const tradeSchema = new mongoose.Schema({
//   // type: { type: String, required: true, enum: ["buy", "sell"]},
//   amount: { type: Number, required: true },
//   price: { type: Number, required: true },
//   buyer_id: { type: mongoose.Types.ObjectId, ref: "users", required: true },
//   seller_id: { type: mongoose.Types.ObjectId, ref: "users", required: true },
//   cryptocurrency_id: { type: mongoose.Types.ObjectId, ref: 'cryptocurrencies', required: true },
//   created_at: { type: Date, default: Date.now },
// });

// const trade = mongoose.model('trades', tradeSchema);

// trade.prototype.getCryptocurrency = async function() {
//   const cryptocurrency = await Cryptocurrency.findById(this.cryptocurrency_id);
//   return cryptocurrency;
// };

// module.exports = trade;

//tradeModel.js
const mongoose = require('mongoose');
const Cryptocurrency = require('./cryptocurrencyModel');

const tradeSchema = new mongoose.Schema({
  // type: { type: String, required: true, enum: ["buy", "sell"]},
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  order_id: {type: Number, required: true},
  buyer_id: { type: mongoose.Types.ObjectId, ref: "users", required: true },
  seller_id: { type: mongoose.Types.ObjectId, ref: "users", required: true },
  cryptocurrency_id_A: { type: mongoose.Types.ObjectId, ref: 'cryptocurrencies', required: true },
  cryptocurrency_id_B: {type: mongoose.Types.ObjectId, ref: 'cryptocurrencies', required: true},
  created_at: { type: Date, default: Date.now },
});

const trade = mongoose.model('trades', tradeSchema);

module.exports = trade;