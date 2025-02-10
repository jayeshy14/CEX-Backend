//tradeController.js
const { default: mongoose } = require("mongoose");
const Trade = require("../models/tradeModel");

exports.getAllTrades = async (req, res) => {
	// #swagger.tags = ["trades"]
	// #swagger.summary = "Get all trades"
	try {
		const trades = await Trade.find();
		res.status(200).json({
			status: "success",
			results: trades.length,
			data: {
				trades,
			},
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.getOneTrade = async (req, res) => {
	// #swagger.tags = ["trades"]
	// #swagger.summary = "Get trade by id"
	try {
		const tradeId = new mongoose.Types.ObjectId(req.params.id);
		const trade = await Trade.findById(tradeId);
		if (!tradeId) {
			return res.status(404).json({
				status: "fail",
				data: `trade id:${tradeId} not found`,
			});
		}

		const cryptocurrency = await trade.getCryptocurrency();
		res.status(200).json({
			status: "success",
			data: {
				trade,
				cryptocurrency,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.createTrade = async (req, res) => {
	// #swagger.tags = ["trades"]
	// #swagger.summary = "Create trades"
	const {
		type,
		amount,
		price,
		order_id,
		source_wallet_id,
		destination_wallet_id,
		cryptocurrency_id,
	} = req.body;
	try {
		const trade = await Trade.create({
			type,
			amount: Number(amount),
			price: Number(price),
			order_id,
			source_wallet_id,
			destination_wallet_id,
			cryptocurrency_id,
			created_at: new Date(),
		});

		res.status(200).json({
			status: "success",
			data: {
				trade,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(400).json({
			status: "fail",
		});
	}
};
