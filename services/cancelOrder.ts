import Order from '../models/orderModel';
import Wallet from '../models/walletModel';
import Cryptocurrency from '../models/cryptocurrencyModel';

export const cancelOrder = async (orderId: string): Promise<void> => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');
  if (order.status === 'filled') throw new Error('Cannot cancel a filled order');
  if (order.status === 'canceled') throw new Error('Order is already canceled');

  const userWallet = await Wallet.findOne({ user_id: order.user_id });
  if (!userWallet) throw new Error('User wallet not found');

  // Refund the locked asset: buy orders lock quote (B), sell orders lock base (A)
  const refundCryptoId = order.type === 'buy' ? order.cryptocurrency_id_B : order.cryptocurrency_id_A;
  const crypto = await Cryptocurrency.findById(refundCryptoId);
  if (!crypto) throw new Error('Cryptocurrency not found');

  const current = userWallet.balances.get(crypto.symbol) ?? 0;
  userWallet.balances.set(crypto.symbol, current + order.amount);
  await userWallet.save();

  order.status = 'canceled';
  await order.save();

  console.log(`Order ${orderId} canceled. ${order.amount} ${crypto.symbol} refunded.`);
};
