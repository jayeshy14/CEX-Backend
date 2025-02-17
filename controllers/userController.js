const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Wallet = require("../models/walletModel");
const Order = require("../models/orderModel");
const bcrypt = require("bcryptjs");
const { JWT_SECRET } = require("../config/config");

exports.getUserProfile = async (req, res) => {
	try {
		const userId = req.user?._id || req.body.userId || req.query.userId;
		if (!userId) {
			return res.status(400).json({ status: "fail", message: "User ID is required" });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ status: "fail", message: "User not found" });
		}

		const wallet = await Wallet.findOne({ user_id: userId });
		const orderHistory = await Order.find({ user_id: userId, status: { $in: ["filled", "canceled"] } });
		const openOrders = await Order.find({ user_id: userId, status: "open" });

		res.status(200).json({
			status: "success",
			data: { user, wallet, orderHistory, openOrders },
		});
	} catch (error) {
		res.status(500).json({ status: "fail", message: "Error fetching user profile" });
	}
};

exports.createUser = async (req, res) => {
	const { firstName, lastName, phoneNumber, email, password, confirmPassword } = req.body;

	try {
		if (!firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
			return res.status(400).json({ message: "All fields are required" });
		}

		if (password !== confirmPassword) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		if (await User.findOne({ email })) {
			return res.status(400).json({ message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
			first_name: firstName,
			last_name: lastName,
			phone_number: phoneNumber,
			email,
			password: hashedPassword,
		});

		await Wallet.create({ user_id: user._id, usd_balance: 0, cryptos: [] });

		const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "365d" });

		res.status(201).json({ token });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.loginUser = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "365d" });

		res.status(200).json({ status: "success", token, userId: user._id });
	} catch (error) {
		res.status(500).send("Server error");
	}
};

exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json({ status: "success", results: users.length, data: { users } });
	} catch (error) {
		res.status(400).json({ status: "fail" });
	}
};

exports.getOneUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ status: "fail", message: "User not found" });

		const wallet = await Wallet.findOne({ user_id: user._id });
		const orderHistory = await Order.find({ user_id: user._id, status: { $in: ["filled", "canceled"] } });
		const openOrders = await Order.find({ user_id: user._id, status: "open" });

		res.status(200).json({ status: "success", data: { user, wallet, orderHistory, openOrders } });
	} catch (error) {
		res.status(500).json({ status: "fail", message: "Error fetching user details" });
	}
};

exports.updateUser = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true, runValidators: true });

		res.status(200).json({ status: "success", data: { user } });
	} catch (error) {
		res.status(400).json({ status: "fail" });
	}
};

exports.deleteUser = async (req, res) => {
	try {
		if (!(await User.findById(req.params.id))) {
			return res.status(404).json({ status: "fail", message: "User not found" });
		}
		await User.findByIdAndDelete(req.params.id);
		res.status(200).json({ status: "success" });
	} catch (error) {
		res.status(400).json({ status: "fail" });
	}
};
