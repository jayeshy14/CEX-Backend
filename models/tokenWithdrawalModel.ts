import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITokenWithdrawal extends Document {
  user_id: Types.ObjectId;
  to_address: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  tx_hash?: string;
  created_at: Date;
  updated_at: Date;
}

const tokenWithdrawalSchema = new Schema<ITokenWithdrawal>({
  user_id: { type: Schema.Types.ObjectId, ref: 'users' },
  to_address: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  tx_hash: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const TokenWithdrawal = mongoose.model<ITokenWithdrawal>('token_withdrawals', tokenWithdrawalSchema);
export default TokenWithdrawal;
