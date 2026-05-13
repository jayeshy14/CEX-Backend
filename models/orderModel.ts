import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrder extends Document {
  _id: Types.ObjectId;
  type: 'buy' | 'sell';
  order_type: 'limit' | 'market';
  user_id: Types.ObjectId;
  cryptocurrency_id_A: Types.ObjectId;
  cryptocurrency_id_B: Types.ObjectId;
  amount: number;
  price: number | null;
  created_at: Date;
  status: 'open' | 'filled' | 'canceled';
  trades: Types.ObjectId[];
}

const orderSchema = new Schema<IOrder>({
  type: { type: String, enum: ['buy', 'sell'], required: true },
  order_type: { type: String, enum: ['limit', 'market'], required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  cryptocurrency_id_A: { type: Schema.Types.ObjectId, ref: 'cryptocurrencies', required: true },
  cryptocurrency_id_B: { type: Schema.Types.ObjectId, ref: 'cryptocurrencies', required: true },
  amount: { type: Number, required: true },
  price: { type: Number, default: null },
  created_at: { type: Date, default: Date.now, required: true },
  status: { type: String, enum: ['open', 'filled', 'canceled'], default: 'open', required: true },
  trades: [{ type: Schema.Types.ObjectId, ref: 'trades' }],
});

orderSchema.pre('validate', function (next) {
  if (this.order_type === 'limit' && this.price == null) {
    next(new Error('Price is required for limit orders'));
  } else if (this.order_type === 'market') {
    this.price = null;
  }
  next();
});

const Order = mongoose.model<IOrder>('orders', orderSchema);
export default Order;
