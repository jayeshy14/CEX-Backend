import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWalletChain {
  chain: Types.ObjectId;
  address: string;
}

export interface IWallet extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  usd_balance: number;
  balances: Map<string, number>;
  chains: IWalletChain[];
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'users', unique: true, required: true },
    usd_balance: { type: Number, default: 0 },
    balances: { type: Map, of: Number, default: {} },
    chains: [
      {
        chain: { type: Schema.Types.ObjectId, ref: 'chains', required: true },
        address: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Wallet = mongoose.model<IWallet>('wallets', walletSchema);
export default Wallet;
