//walletRoute.js
const express = require("express");
const walletController = require("../controllers/walletController");

const router = express.Router();

router
	.route("/")
	.get(walletController.getAllWallets)
	.post(walletController.createWallet);

router
	.route("/:id")
	.get(walletController.getOneWallet)
	.patch(walletController.updateWallet)
	.delete(walletController.deleteWallet);

module.exports = router;
