import mongoose, { Document, Schema } from 'mongoose';

export interface ICryptocurrencyChain {
  chain_name: string;
  wallet_address: string;
  contract_address: string;
  supply: number;
}

export interface ICryptocurrency extends Document {
  name: string;
  symbol: string;
  current_price: number;
  total_supply: number;
  decimals: number;
  chains: ICryptocurrencyChain[];
  created_at: Date;
  updated_at: Date;
}

const cryptocurrencySchema = new Schema<ICryptocurrency>({
  name: { type: String, unique: true, required: true },
  symbol: { type: String, unique: true, required: true },
  current_price: { type: Number, required: true },
  total_supply: { type: Number, default: 0, required: true },
  decimals: { type: Number, default: 0, required: true },
  chains: [
    {
      chain_name: { type: String, required: true },
      wallet_address: { type: String, required: true },
      contract_address: { type: String, default: '' },
      supply: { type: Number, default: 0, required: true },
    },
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

cryptocurrencySchema.pre('save', function (next) {
  this.total_supply = this.chains.reduce((sum, chain) => sum + (chain.supply || 0), 0);
  next();
});

cryptocurrencySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as { chains?: ICryptocurrencyChain[] };
  if (update?.chains) {
    // total_supply is recomputed on next save
  }
  next();
});

const Cryptocurrency = mongoose.model<ICryptocurrency>('Cryptocurrency', cryptocurrencySchema);
export default Cryptocurrency;
