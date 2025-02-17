

const Order = require("../../models/orderModel");

const getOrderBook = async (cryptocurrencyIdA, cryptocurrencyIdB) => {
    const marketBuyOrders = await Order.find({
        cryptocurrency_id_A: cryptocurrencyIdA,
        cryptocurrency_id_B: cryptocurrencyIdB,
        type: "buy",
        status: "open",
        order_type: "market",
    }).sort({price: -1, created_at: 1}).limit(5);

    const marketSellOrders = await Order.find({
        cryptocurrency_id_A: cryptocurrencyIdA,
        cryptocurrency_id_B: cryptocurrencyIdB,
        type: "sell",
        status: "open",
        order_type: "market",
    }).sort({price: 1, created_at: 1}).limit(5);

    const limitBuyOrders = await Order.find({
        cryptocurrency_id_A: cryptocurrencyIdA,
        cryptocurrency_id_B: cryptocurrencyIdB,
        type: "buy",
        status: "open",
        order_type: "limit",
    }).sort({price: -1, created_at: 1}).limit(5);

    const limitSellOrders = await Order.find({
        cryptocurrency_id_A: cryptocurrencyIdA,
        cryptocurrency_id_B: cryptocurrencyIdB,
        type: "sell",
        status: "open",
        order_type: "limit",
    }).sort({price: 1, created_at: 1}).limit(5);

    return {limitBuyOrders, limitSellOrders, marketBuyOrders, marketSellOrders};
}

module.exports = { getOrderBook };