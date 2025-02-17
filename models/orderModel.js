//orderModel.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  type: { type: String, enum: ["buy", "sell"], required: true },
  order_type: {type: String, enum: ["limit", "market"], required: true},
  user_id: { type: mongoose.Types.ObjectId, ref: "users", required: true }, 
  cryptocurrency_id_A: { type: mongoose.Types.ObjectId, ref: "cryptocurrencies", required: true },
  cryptocurrency_id_B: {type: mongoose.Types.ObjectId, ref: "cryptocurrencies", required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  created_at: { type: Date, default: Date.now, required: true },
  status: { type: String, enum: ["open", "filled", "canceled"], default: "open", required: true },
  trades: [{ type: mongoose.Types.ObjectId, ref: "trades" }],
});

// Ensure price is only required for limit orders
orderSchema.pre("validate", function (next) {
  if (this.order_type === "limit" && this.price == null) {
    next(new Error("Price is required for limit orders"));
  } else if (this.order_type === "market") {
    this.price = null; 
  }
  next();
});

const Order = mongoose.model("orders", orderSchema);

module.exports = Order;

