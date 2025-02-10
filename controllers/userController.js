//userController.js
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Trade = require("../models/tradeModel");
const Order = require("../models/orderModel")
const Wallet = require("../models/walletModel");
const WalletCryptocurrency =  require("../models/walletCryptocurrencyModel");
const bcrypt = require("bcryptjs");


exports.getUserProfile = async (req, res) => {
	try {
	  console.log("Request received:", req.headers, req.body, req.query);
  
	  const userId = req.query.userId || req.body.userId || req.params.userId;
	  if (!userId) {
		console.error("User ID is missing from request");
		return res.status(400).json({ status: "fail", message: "User ID is required" });
	  }
  
	  console.log("Fetching user profile for ID:", userId);
  
	  const user = await User.findById(userId);
	  if (!user) {
		console.error("User not found:", userId);
		return res.status(404).json({ status: "fail", message: "User not found" });
	  }
  
	  console.log("User found:", user);
  
	  const wallet = await Wallet.findOne({ user_id: userId });
  
	  if (!wallet) {
		console.error("User wallet not found:", userId);
		return res.status(404).json({ status: "fail", message: "User wallet not found" });
	  }
  
	  console.log("User wallet found:", wallet);
  
	  const orderHistory = await Order.find({ user_id: userId, status: { $in: ["filled", "canceled"] } });
	  const openOrders = await Order.find({ user_id: userId, status: "open" });
  
	  console.log("Wallets:", wallet);
	  console.log("Order History:", orderHistory);
  
	  res.status(200).json({
		status: "success",
		data: { user, wallet, orderHistory, openOrders },
	  });
	} catch (error) {
	  console.error("Error fetching user profile:", error);
	  res.status(500).json({ status: "fail", message: "Error fetching user profile" });
	}
  };

exports.getUserBalance =  async (req, res) => {
  try {
	const userId = req.user?._id || req.body.userId || req.query.userId;
	if (!userId) {
	  return res.status(400).json({ status: "fail", message: "User ID is required" });
	}
    const wallet = await Wallet.findOne({ user_id: userId });

	if (!wallet) {
		return res.status(404).json({
		  status: "fail",
		  message: "Wallet not found",
		});
	}
 
	} catch (error) {
	  console.log(error);
	  res.status(400).json({
		status: "fail",
		message: "Error fetching wallet balance",
	  });
	}
  };

  exports.createUser = async (req, res) => {
    const { firstName, lastName, phoneNumber, email, password, confirmPassword } = req.body;

    try {
        if (!firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
            console.log("Missing required fields!");
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            email: email,
            password: hashedPassword,
        });

        const newWallet = await Wallet.create({
            user_id: user._id,
            usd_balance: 0,  
            cryptos: [],  
            created_at: new Date(),
            updated_at: new Date(),
        });

		console.log("New wallet is created with the id: ", newWallet._id);

        const token = jwt.sign({ id: user._id }, "669a099e750c4f862dd99c2ee625145fc09a4c974be8fe8ec6e1e0b40e50d26e07a22b0bed77df825bf673c3a347023149f0c1b5186919161010b426745f48ab0e456fdb40b83c6f2475e659292e94ea50c335507e3a48f3d61e525610108086ca4121062859ea8c08a375dc1d93fd1a68eb771e1f7ad17169bcd26edf47ba7d", {
            expiresIn: (60 * 60 * 24 * 365) 
        });

        res.status(201).json({ token });
    } catch (error) {
        console.error("Error in createUser:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
  
  // Login function
  exports.loginUser = async (req, res) => {
	const { email, password } = req.body;
	try {
	  // Check if user exists
	  const user = await User.findOne({ email });
	  if (!user) {
		return res.status(400).json({ message: "Invalid credentials" });
	  }

	  const isMatch = await bcrypt.compare(password, user.password);
	  if (!isMatch) {
		return res.status(400).json({ message: 'Invalid credentials' });
	  }
  
  
	  const token = jwt.sign({ id: user._id }, "669a099e750c4f862dd99c2ee625145fc09a4c974be8fe8ec6e1e0b40e50d26e07a22b0bed77df825bf673c3a347023149f0c1b5186919161010b426745f48ab0e456fdb40b83c6f2475e659292e94ea50c335507e3a48f3d61e525610108086ca4121062859ea8c08a375dc1d93fd1a68eb771e1f7ad17169bcd26edf47ba7d", {
		expiresIn: (60 * 60 * 24 * 365) 
	  });
  
	  res.status(200).json({
		status: "success",
		token,
		userId: user._id,
	  });
  
	} catch (error) {
	  console.error(error.message);
	  res.status(500).send('Server error');
	}
  };

exports.getAllUsers = async (req, res) => {
	// #swagger.tags = ["User"]
	// #swagger.summary = "Get all users"
	try {
		const users = await User.find();
		res.status(200).json({
			status: "success",
			results: users.length,
			data: {
				users,
			},
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};


  exports.getOneUser = async (req, res) => {
	try {
	  const userId = req.params.id;
	  const user = await User.findById(userId);
	  if (!user) {
		console.error("User not found:", userId);
		return res.status(404).json({ status: "fail", message: "User not found" });
	  }
  
	  console.log("User found:", user);
  
	  const wallet = await Wallet.findOne({ user_id: userId });
  
	  if (!wallet) {
		console.error("User wallet not found:", wallet);
		return res.status(404).json({ status: "fail", message: "User wallet not found" });
	  }
  
	  console.log("User wallet found:", wallet);
  
	  const ownedTokens = await WalletCryptocurrency.find({ wallet_id: wallet._id });
  
	  const orderHistory = await Order.find({ user_id: userId, status: { $in: ["filled", "canceled"] } });
	  const openOrders = await Order.find({ user_id: userId, status: "open" });
  
	  console.log("Wallet Cryptos:", ownedTokens);
	  console.log("Order History:", orderHistory);
  
	  res.status(200).json({
		status: "success",
		data: { user, wallet, ownedTokens, orderHistory, openOrders },
	  });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ status: "fail", message: "Error fetching user details" });
	}
  };

exports.createUserMany = async (req, res) => {
	// #swagger.tags = ["User"]
	// #swagger.summary = "Create many users"
	try {
		const users = await User.insertMany(req.body);

		res.status(200).json({
			status: "success",
			data: {
				users,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.updateUser = async (req, res) => {
	// #swagger.tags = ["User"]
	// #swagger.summary = "Update user by id"
	const { firstName, lastName, email, phone_number } = req.body;
	try {
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{
				firstName,
				lastName,
				email,
				phone_number,
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
				user,
			},
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.deleteUser = async (req, res) => {
	// #swagger.tags = ["User"]
	// #swagger.summary = "Delete user by id"
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({
				status: "fail",
				data: "id not found",
			});
		}
		await User.findByIdAndDelete(req.params.id);

		res.status(200).json({
			status: "success",
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};

exports.deleteUserMany = async (req, res) => {
	// #swagger.tags = ["User"]
	// #swagger.summary = "Delete many users"
	try {
		await User.deleteMany();
		res.status(200).json({
			status: "success",
		});
	} catch (error) {
		res.status(400).json({
			status: "fail",
		});
	}
};
