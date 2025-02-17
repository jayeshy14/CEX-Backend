const Wallet = require("../models/walletModel");

exports.getAllWallets = async (req, res) => {
	try {
		const wallets = await Wallet.find();
		res.status(200).json({ status: "success", results: wallets.length, data: { wallets } });
	} catch (error) {
		res.status(400).json({ status: "fail" });
	}
};

exports.getOneWallet = async (req, res) => {
	try {
		const wallet = await Wallet.findById(req.params.id);
		if (!wallet) {
			return res.status(404).json({ status: "fail", message: "Wallet not found" });
		}
		res.status(200).json({ status: "success", data: { wallet } });
	} catch (error) {
		res.status(400).json({ status: "fail" });
	}
};

exports.createWallet = async (req, res) => {
	try {
		const wallet = await Wallet.create({ ...req.body, created_at: new Date(), updated_at: new Date() });
		res.status(201).json({ status: "success", data: { wallet } });
	} catch (error) {
		res.status(400).json({ status: "fail" });
	}
};

exports.updateWallet = async (req, res) => {
	try {
		const wallet = await Wallet.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true, runValidators: true });

		if (!wallet) {
			return res.status(404).json({ status: "fail", message: "Wallet not found" });
		}

		res.status(200).json({ status: "success", data: { wallet } });
	} catch (error) {
		res.status(400).json({ status: "fail" });
	}
};

exports.deleteWallet = async (req, res) => {
	try {
		const wallet = await Wallet.findById(req.params.id);
		if (!wallet) {
			return res.status(404).json({ status: "fail", message: "Wallet not found" });
		}
		await Wallet.findByIdAndDelete(req.params.id);
		res.status(200).json({ status: "success" });
	} catch (error) {
		res.status(400).json({ status: "fail" });
	}
};
