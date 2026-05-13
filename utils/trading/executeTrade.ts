import Trade from '../../models/tradeModel';
import Wallet from '../../models/walletModel';
import Cryptocurrency from '../../models/cryptocurrencyModel';
import { IOrder } from '../../models/orderModel';
import { Types } from 'mongoose';

export const executeTrade = async (
  buyOrder: IOrder,
  sellOrder: IOrder,
  tradeAmount: number,
  tradePrice: number,
  cryptocurrencyIdA: Types.ObjectId,
  cryptocurrencyIdB: Types.ObjectId
): Promise<void> => {
  const [buyerWallet, sellerWallet, cryptoA, cryptoB] = await Promise.all([
    Wallet.findOne({ user_id: buyOrder.user_id }),
    Wallet.findOne({ user_id: sellOrder.user_id }),
    Cryptocurrency.findById(cryptocurrencyIdA),
    Cryptocurrency.findById(cryptocurrencyIdB),
  ]);

  if (!buyerWallet || !sellerWallet) throw new Error('Wallet not found for buyer or seller');
  if (!cryptoA || !cryptoB) throw new Error('Cryptocurrency not found');

  const symbolA = cryptoA.symbol;
  const symbolB = cryptoB.symbol;

  const buyerBalanceB = buyerWallet.balances.get(symbolB) ?? 0;
  const sellerBalanceA = sellerWallet.balances.get(symbolA) ?? 0;

  if (buyerBalanceB < tradeAmount * tradePrice) {
    throw new Error('Buyer does not have enough balance to buy');
  }
  if (sellerBalanceA < tradeAmount) {
    throw new Error('Seller does not have enough balance to sell');
  }

  // Settle balances
  buyerWallet.balances.set(symbolB, buyerBalanceB - tradeAmount * tradePrice);
  buyerWallet.balances.set(symbolA, (buyerWallet.balances.get(symbolA) ?? 0) + tradeAmount);
  sellerWallet.balances.set(symbolA, sellerBalanceA - tradeAmount);
  sellerWallet.balances.set(symbolB, (sellerWallet.balances.get(symbolB) ?? 0) + tradeAmount * tradePrice);

  // Decrement order amounts and mark filled
  buyOrder.amount -= tradeAmount;
  if (buyOrder.amount === 0) buyOrder.status = 'filled';

  sellOrder.amount -= tradeAmount;
  if (sellOrder.amount === 0) sellOrder.status = 'filled';

  const trade = await Trade.create({
    cryptocurrency_id_A: cryptocurrencyIdA,
    cryptocurrency_id_B: cryptocurrencyIdB,
    order_id: buyOrder._id,
    buyer_id: buyOrder.user_id,
    seller_id: sellOrder.user_id,
    amount: tradeAmount,
    price: tradePrice,
    created_at: Date.now(),
  });

  buyOrder.trades.push(trade._id);
  sellOrder.trades.push(trade._id);

  await Promise.all([
    buyerWallet.save(),
    sellerWallet.save(),
    buyOrder.save(),
    sellOrder.save(),
  ]);

  // Update last traded price
  cryptoA.current_price = tradePrice;
  await cryptoA.save();
};
