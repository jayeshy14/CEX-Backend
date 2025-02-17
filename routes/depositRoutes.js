//cryptocurrencyRoute.js
const express = require("express");
const depositController = require("../controllers/depositController")
const evmDepositController = require("../controllers/EVM-chains/depositController")
const solanaDepositController = require("../controllers/Solana/depositController")
const router = express.Router();

router
	.post("/getDepositAddress", depositController.getOrGenerateDepositAddress);

router
	.post("/handleEvmDeposit", evmDepositController.handleEvmDeposit);

router
	.post("/handleSolanaDeposit", solanaDepositController.handleSolanaDeposit);

module.exports = router;
