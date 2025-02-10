//walletCryptocurrencyController.js
const mongoose = require("mongoose");
const WalletCryptocurrency = require("../models/walletCryptocurrencyModel")

exports.createWalletCryptocurrency = async (req, res) => {
	// #swagger.tags = ["WalletCryptocurrencies"]
	// #swagger.summary = "Create WalletCryptocurrency"
	try {
		const walletCryptocurrency = await WalletCryptocurrency.create({
			cryptocurrency_amount: 0,
			wallet_id: req.body.wallet_id,
			cryptocurrency_id: req.body.cryptocurrency_id
		});
		res.status(200).json({
			status: "success",
			data: {
				walletCryptocurrency,
			},
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.getAllWalletCryptocurrency = async (req, res) => {
	// #swagger.tags = ["WalletCryptocurrencies"]
	// #swagger.summary = "Get all WalletCryptocurrencies"
	try {
		const walletCryptocurrency = await WalletCryptocurrency.find();
		res.status(200).json({
			status: "success",
			results: walletCryptocurrency.length,
			data: {
				walletCryptocurrency,
			},
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.getOneWallCryptocurrency = async (req, res) => {
	// #swagger.tags = ["WalletCryptocurrencies"]
	// #swagger.summary = "Get WalletCryptocurrency by id"
	try {
		const walletCryptocurrency = await WalletCryptocurrency.findById(req.params.id);
		res.status(200).json({
			status: "success",
			results: walletCryptocurrency.length,
			data: {
				walletCryptocurrency,
			},
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};