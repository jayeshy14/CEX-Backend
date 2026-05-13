import { Request, Response } from 'express';
import Order from '../models/orderModel';
import { matchOrders } from '../services/matchingEngine';
import { getOrderBook as getOrderBookUtil } from '../utils/trading/orderBook';
import { cancelOrder as cancelOrderService } from '../services/cancelOrder';

export const placeOrder = async (req: Request, res: Response): Promise<void> => {
  const { type, order_type, user_id, cryptocurrency_id_A, cryptocurrency_id_B, amount, price } = req.body;

  try {
    if (amount <= 0) {
      res.status(400).json({ status: 'fail', error: 'Amount must be greater than zero' });
      return;
    }
    if (price <= 0 && order_type === 'limit') {
      res.status(400).json({ status: 'fail', error: 'Price must be greater than zero for limit orders' });
      return;
    }

    const order = await Order.create({
      type,
      order_type,
      user_id,
      cryptocurrency_id_A,
      cryptocurrency_id_B,
      amount,
      price,
      created_at: new Date(),
      status: 'open',
      trades: [],
    });

    await matchOrders(cryptocurrency_id_A, cryptocurrency_id_B);

    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ status: 'fail', error: msg });
  }
};

export const getOrderBook = async (req: Request, res: Response): Promise<void> => {
  const cryptocurrencyIdA = String(req.params.cryptocurrencyIdA);
  const cryptocurrencyIdB = String(req.params.cryptocurrencyIdB);
  try {
    const orderBook = await getOrderBookUtil(cryptocurrencyIdA, cryptocurrencyIdB);
    res.status(200).json({ status: 'success', data: { orderBook } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ status: 'fail', error: msg });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user_id: req.user!._id }).sort({ created_at: -1 });
    res.status(200).json({ status: 'success', data: { orders } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ status: 'fail', error: msg });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    await cancelOrderService(orderId);
    res.status(200).json({ status: 'success', message: 'Order canceled successfully' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ status: 'fail', error: msg });
  }
};
