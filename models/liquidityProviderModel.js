const mongoose = require('mongoose');

const liquidityProviderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Types.ObjectId, ref: 'users', required: true },
  pool_id: { type: mongoose.Types.ObjectId, ref: 'liquidityPools', required: true },
  lp_tokens: { type: Number, default: 0 }, // LP tokens representing ownership in the pool
});

const LiquidityProvider = mongoose.model('liquidityProviders', liquidityProviderSchema);
module.exports = LiquidityProvider;
