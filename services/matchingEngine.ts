import { Types } from 'mongoose';
import { getOrderBook } from '../utils/trading/orderBook';
import { executeTrade } from '../utils/trading/executeTrade';

/**
 * Matches orders and executes trades.
 * @param cryptocurrencyIdA The asset being bought.
 * @param cryptocurrencyIdB The asset being sold (quoted currency).
 */
export const matchOrders = async (
  cryptocurrencyIdA: Types.ObjectId | string,
  cryptocurrencyIdB: Types.ObjectId | string
): Promise<void> => {
  const idA =
    typeof cryptocurrencyIdA === 'string' ? new Types.ObjectId(cryptocurrencyIdA) : cryptocurrencyIdA;
  const idB =
    typeof cryptocurrencyIdB === 'string' ? new Types.ObjectId(cryptocurrencyIdB) : cryptocurrencyIdB;

  const { limitBuyOrders, limitSellOrders, marketBuyOrders, marketSellOrders } = await getOrderBook(
    idA,
    idB
  );

  // Match Market Buy Orders with Limit Sell Orders
  for (const marketBuyOrder of marketBuyOrders) {
    let remainingAmount = marketBuyOrder.amount;

    for (const limitSellOrder of limitSellOrders) {
      if (remainingAmount === 0) break;

      if (limitSellOrder.amount > 0 && limitSellOrder.price != null) {
        const tradeAmount = Math.min(remainingAmount, limitSellOrder.amount);
        const tradePrice = limitSellOrder.price;

        await executeTrade(marketBuyOrder, limitSellOrder, tradeAmount, tradePrice, idA, idB);

        remainingAmount -= tradeAmount;
      }
    }

    if (remainingAmount > 0) {
      console.log('Market buy order partially filled or no more matching sell orders.');
    }
  }

  // Match Market Sell Orders with Limit Buy Orders
  for (const marketSellOrder of marketSellOrders) {
    let remainingAmount = marketSellOrder.amount;

    for (const limitBuyOrder of limitBuyOrders) {
      if (remainingAmount === 0) break;

      if (limitBuyOrder.amount > 0 && limitBuyOrder.price != null) {
        const tradeAmount = Math.min(remainingAmount, limitBuyOrder.amount);
        const tradePrice = limitBuyOrder.price;

        await executeTrade(limitBuyOrder, marketSellOrder, tradeAmount, tradePrice, idA, idB);

        remainingAmount -= tradeAmount;
      }
    }

    if (remainingAmount > 0) {
      console.log('Market sell order partially filled or no more matching buy orders.');
    }
  }

  // Match Limit Buy Orders with Limit Sell Orders
  for (const buyOrder of limitBuyOrders) {
    for (const sellOrder of limitSellOrders) {
      if (
        buyOrder.price != null &&
        sellOrder.price != null &&
        buyOrder.price >= sellOrder.price &&
        buyOrder.amount > 0 &&
        sellOrder.amount > 0
      ) {
        const tradeAmount = Math.min(buyOrder.amount, sellOrder.amount);
        const tradePrice = sellOrder.price;

        await executeTrade(buyOrder, sellOrder, tradeAmount, tradePrice, idA, idB);
      }
    }
  }
};
