const Order = require("../models/orderModel");
const { matchOrders } = require("../services/matchingEngine");
const { getOrderBook } = require("../utils/trading/orderBook");
const { cancelOrder } = require("../services/cancelOrder");

exports.placeOrder = async (req, res) => {
    const { type, order_type, user_id, cryptocurrency_id_A, cryptocurrency_id_B, amount, price } = req.body;

    try {
        if (amount <= 0) {
            return res.status(400).json({ status: "fail", error: "Amount must be greater than zero" });
        }
        if (price <= 0 && order_type === "limit") {
            return res.status(400).json({ status: "fail", error: "Price must be greater than zero for limit orders" });
        }

        const order = await Order.create({
            type, 
            order_type, 
            user_id, 
            cryptocurrency_id_A, 
            cryptocurrency_id_B, 
            amount, 
            price, 
            created_at: Date.now(),
            status: "open",
            trades: []
        });

        await matchOrders(cryptocurrency_id_A, cryptocurrency_id_B);

        res.status(200).json({ status: "success", data: { order } });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

exports.getOrderBook = async (req, res) => {
    const { cryptocurrencyIdA, cryptocurrencyIdB } = req.params;
    try {
        const orderBook = await getOrderBook(cryptocurrencyIdA, cryptocurrencyIdB);
        res.status(200).json({ status: "success", data: { orderBook } });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const result = await cancelOrder(orderId);
        res.status(200).json({ status: "success", message: "Order canceled successfully", data: result });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};