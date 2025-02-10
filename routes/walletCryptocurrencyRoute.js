//walletCryptocurrencyRoute.js
const express = require("express");
const walletCryptocurrencyController = require("../controllers/walletCryptocurrencyController");

const router = express.Router();
router
	.route("/")
	.get(walletCryptocurrencyController.getAllWalletCryptocurrency)

module.exports = router;