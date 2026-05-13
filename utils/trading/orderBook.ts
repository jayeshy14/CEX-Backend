import { Types } from 'mongoose';
import Order, { IOrder } from '../../models/orderModel';

export interface OrderBookResult {
  limitBuyOrders: IOrder[];
  limitSellOrders: IOrder[];
  marketBuyOrders: IOrder[];
  marketSellOrders: IOrder[];
}

export const getOrderBook = async (
  cryptocurrencyIdA: Types.ObjectId | string,
  cryptocurrencyIdB: Types.ObjectId | string
): Promise<OrderBookResult> => {
  const baseQuery = {
    cryptocurrency_id_A: cryptocurrencyIdA,
    cryptocurrency_id_B: cryptocurrencyIdB,
    status: 'open',
  };

  const marketBuyOrders = await Order.find({ ...baseQuery, type: 'buy', order_type: 'market' })
    .sort({ price: -1, created_at: 1 })
    .limit(5);

  const marketSellOrders = await Order.find({ ...baseQuery, type: 'sell', order_type: 'market' })
    .sort({ price: 1, created_at: 1 })
    .limit(5);

  const limitBuyOrders = await Order.find({ ...baseQuery, type: 'buy', order_type: 'limit' })
    .sort({ price: -1, created_at: 1 })
    .limit(5);

  const limitSellOrders = await Order.find({ ...baseQuery, type: 'sell', order_type: 'limit' })
    .sort({ price: 1, created_at: 1 })
    .limit(5);

  return { limitBuyOrders, limitSellOrders, marketBuyOrders, marketSellOrders };
};
