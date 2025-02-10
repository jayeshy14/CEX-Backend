const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.post("/place", orderController.placeOrder);
router.post("/cancel", orderController.cancelOrder);
router.get("/:cryptocurrencyIdA/:cryptocurrencyIdB", orderController.getOrderBook);

module.exports = router;