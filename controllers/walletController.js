//walletController.js
const mongoose = require("mongoose");
const Wallet = require("../models/walletModel");
const Cryptocurrency = require("../models/cryptocurrencyModel");

exports.getAllWallets = async (req, res) => {
	// #swagger.tags = ["Wallets"]
	// #swagger.summary = "Get all Wallets"
	try {
		const wallets = await Wallet.find();
		res.status(200).json({
			status: "success",
			results: wallets.length,
			data: {
				wallets,
			},
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.getOneWallet = async (req, res) => {
	// #swagger.tags = ["Wallets"]
	// #swagger.summary = "Get Wallet by id"
	try {
		const walletId = new mongoose.Types.ObjectId(req.params.id);
		const wallet = await Wallet.findById(walletId);
		if (!wallet) {
			return res.status(404).json({
				status: "fail",
				data: "wallet not found",
			});
		}

		// find wallet-crypto
		const walletCryptocurrency = await wallet.getWalletCryptocurrency();

		res.status(200).json({
			status: "success",
			data: {
				wallet,
				walletCryptocurrency,
			},
		});
	} catch (error) {
		console.log(error)
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.createWallet = async (req, res) => {
	// #swagger.tags = ["Wallets"]
	// #swagger.summary = "Create Wallets"
	const { balance, user_id } = req.body;
	try {
		const wallet = await Wallet.create({
			balance: Number(balance),
			user_id,
			created_at: new Date(),
			updated_at: new Date(),
		});

		res.status(200).json({
			status: "success",
			data: {
				wallet,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.createWalletMany = async (req, res) => {
	// #swagger.tags = ["Wallets"]
	// #swagger.summary = "Create many Wallets"
	try {
		const wallets = await Wallet.insertMany(req.body);

		res.status(200).json({
			status: "success",
			data: {
				wallets,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.updateWallet = async (req, res) => {
	// #swagger.tags = ["Wallets"]
	// #swagger.summary = "Update Wallet by id"
	const { balance, user_id } = req.body;
	try {
		const walletId = new mongoose.Types.ObjectId(req.params.id);
		const wallet = await Wallet.findByIdAndUpdate(
			walletId,
			{
				balance: Number(balance),
				user_id,
				updated_at: new Date(),
			},
			{
				new: true,
				runValidators: true,
			}
		);

		res.status(200).json({
			status: "success",
			data: {
				wallet,
			},
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.deleteWallet = async (req, res) => {
	// #swagger.tags = ["Wallets"]
	// #swagger.summary = "Delete Wallet by id"
	try {
		const walletId = new mongoose.Types.ObjectId(req.params.id);
		const wallet = await Wallet.findById(walletId);
		if (!wallet) {
			return res.status(404).json({
				status: "fail",
				data: "id not found",
			});
		}
		await Wallet.findByIdAndDelete(req.params.id);

		res.status(200).json({
			status: "success",
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};
