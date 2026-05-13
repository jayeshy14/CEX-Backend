import mongoose, { Document, Schema } from 'mongoose';

export interface IChainToken {
  symbol: string;
  name: string;
  contract_address: string;
  decimals: number;
}

export interface IChain extends Document {
  name: string;
  symbol: string;
  chain_id: number;
  native_token: string;
  exchange_wallet_address: string;
  rpcUrl: string;
  explorerUrl: string;
  tokens: IChainToken[];
  deposit_addresses: string[];
  createdAt: Date;
  updatedAt: Date;
}

const chainSchema = new Schema<IChain>(
  {
    name: { type: String, unique: true, required: true },
    symbol: { type: String, required: true },
    chain_id: { type: Number, required: true },
    native_token: { type: String, required: true },
    exchange_wallet_address: { type: String, required: true },
    rpcUrl: { type: String, required: true },
    explorerUrl: { type: String, required: true },
    tokens: [
      {
        symbol: { type: String, required: true },
        name: { type: String, required: true },
        contract_address: { type: String, required: true },
        decimals: { type: Number, required: true, default: 18 },
      },
    ],
    deposit_addresses: [{ type: String, required: true }],
  },
  { timestamps: true }
);

const Chain = mongoose.model<IChain>('chains', chainSchema);
export default Chain;
