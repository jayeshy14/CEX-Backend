const mongoose = require('mongoose');

const cryptocurrencySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  symbol: { type: String, unique: true, required: true },
  current_price: { type: Number, required: true },
  total_supply: { type: Number, default: 0, required: true },
  decimals: {type: Number, default: 0, required: true},
  chains: [
    {
      chain_name: { type: String, required: true }, 
      wallet_address: { type: String, required: true }, 
      contract_address: { type: String, default: "" }, 
      supply: {type: Number, default: 0, required: true}
    }
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

cryptocurrencySchema.pre('save', function (next){
  this.total_supply = this.chains.reduce((sum, chain) => sum + chain.supply||0, 0);
  next();
})

cryptocurrencySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if(update.chains){
    this.total_supply = update.chains.reduce((sum, chain) => sum + chain.supply || 0, 0);
  }
  next();
})

const Cryptocurrency = mongoose.model('Cryptocurrency', cryptocurrencySchema);
module.exports = Cryptocurrency;