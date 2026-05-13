import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITrade extends Document {
  _id: Types.ObjectId;
  amount: number;
  price: number;
  order_id: Types.ObjectId;
  buyer_id: Types.ObjectId;
  seller_id: Types.ObjectId;
  cryptocurrency_id_A: Types.ObjectId;
  cryptocurrency_id_B: Types.ObjectId;
  created_at: Date;
}

const tradeSchema = new Schema<ITrade>({
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'orders', required: true },
  buyer_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  seller_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  cryptocurrency_id_A: { type: Schema.Types.ObjectId, ref: 'cryptocurrencies', required: true },
  cryptocurrency_id_B: { type: Schema.Types.ObjectId, ref: 'cryptocurrencies', required: true },
  created_at: { type: Date, default: Date.now },
});

const Trade = mongoose.model<ITrade>('trades', tradeSchema);
export default Trade;
