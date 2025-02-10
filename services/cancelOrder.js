const Order = require("../models/orderModel");
const WalletCryptocurrency = require("../models/walletCryptocurrencyModel");
const Wallet = require("../models/walletModel");

const cancelOrder = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error("Order not found");
    }

    // Check if order is already filled or canceled
    if (order.status === "filled") {
        throw new Error("Cannot cancel a filled order");
    }
    if (order.status === "canceled") {
        throw new Error("Order is already canceled");
    }

    // Fetch user's wallet
    const userWallet = await Wallet.findOne({ user_id: order.user_id });
    if (!userWallet) {
        throw new Error("User wallet not found");
    }

    // Find user's wallet for the relevant cryptocurrency
    const userWalletCryptocurrency = await WalletCryptocurrency.findOne({
        wallet_id: userWallet._id,
        cryptocurrency_id: order.type === "buy" ? order.cryptocurrency_id_B : order.cryptocurrency_id_A,
    });

    if (!userWalletCryptocurrency) {
        throw new Error("Cryptocurrency wallet not found for user");
    }

    // Refund the remaining amount only if the order is partially filled
    if (order.amount > 0) {
        userWalletCryptocurrency.cryptocurrency_amount += order.amount;
        await userWalletCryptocurrency.save();
    }

    // Update order status to "canceled"
    order.status = "canceled";
    await order.save();

    console.log(`Order ${orderId} has been canceled. Remaining amount refunded.`);
};

module.exports = { cancelOrder };