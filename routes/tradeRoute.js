//tradeRoute.js
const express = require("express");
const tradeController = require("../controllers/tradeController");

const router = express.Router();

router
	.route("/")
	.get(tradeController.getAllTrades)
	.post(tradeController.createTrade)

router
	.route("/:id")
	.get(tradeController.getOneTrade)

module.exports = router;
