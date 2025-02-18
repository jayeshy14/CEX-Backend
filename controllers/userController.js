const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Wallet = require("../models/walletModel");
const Order = require("../models/orderModel");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require('google-auth-library');  // Import OAuth2Client
const nodemailer = require('nodemailer');
const crypto = require('crypto');


const { JWT_SECRET, GOOGLE_CLIENT_ID } = require('../config/config');





const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(tokenId) {
	try {
	  const ticket = await client.verifyIdToken({
		idToken: tokenId,
		audience: GOOGLE_CLIENT_ID, // Ensure this matches your Google Client ID
	  });
	  return ticket.getPayload(); // Contains the user details
	} catch (error) {
	  throw new Error('Google Authentication Failed');
	}
  }

  const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: process.env.EMAIL_USER,
	  pass: process.env.EMAIL_PASS,
	},
  });

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

exports.googleLogin = async (req, res) => {
	const { tokenId } = req.body;
  
	try {
	  // Verify the Google token
	  const googleUser = await verifyGoogleToken(tokenId);
  
	  // Check if the user exists in the DB, based on the Google ID or email
	  let user = await User.findOne({ $or: [{ googleId: googleUser.sub }, { email: googleUser.email }] });
  
	  if (!user) {
		// If the user doesn't exist, create a new user with data from Google
		user = new User({
		  first_name: googleUser.given_name,
		  last_name: googleUser.family_name,
		  email: googleUser.email,
		  googleId: googleUser.sub,
		  role: 'user', // Default role can be 'user'
		});
		await user.save();
	  }
  
	  // Create a JWT token
	  const token = jwt.sign(
		{ userId: user._id, email: user.email, role: user.role },
		JWT_SECRET,
		{ expiresIn: '365d' }
	  );
  
	  res.status(200).json({ token });
	} catch (error) {
	  console.error('Google Authentication Error:', error);
	  res.status(500).json({ message: 'Google Authentication failed' });
	}
};


// Forgot password controller
exports.forgotPassword = async (req, res) => {
	const { email } = req.body;
  
	try {
	  // Check if user exists
	  const user = await User.findOne({ email });
	  if (!user) {
		return res.status(404).json({ message: 'User not found' });
	  }
  
	  // Generate a reset token
	  const token = crypto.randomBytes(32).toString('hex');
	  const expiration = Date.now() + 3600000; // Token expires in 1 hour
  
	  // Save token and expiration time in the database
	  user.resetToken = token;
	  user.resetTokenExpiration = expiration;
	  await user.save();
  
	  // Send reset password email with the token
	  const resetUrl = `http://localhost:5173/reset-password/${token}`;
	  await transporter.sendMail({
		to: email,
		subject: 'Password Reset Request',
		text: `To reset your password, click the link below:\n\n${resetUrl}`,
	  });
  
	  res.status(200).json({ message: 'Password reset link has been sent to your email' });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ message: 'Something went wrong, please try again later' });
	}
  };

  // Reset password controller
exports.resetPassword = async (req, res) => {
	const { token } = req.params;
	const { password } = req.body;
  
	try {
	  // Find user with the reset token and ensure the token is valid
	  const user = await User.findOne({
		resetToken: token,
		resetTokenExpiration: { $gt: Date.now() }, // Token is still valid
	  });
  
	  if (!user) {
		return res.status(400).json({ message: 'Invalid or expired token' });
	  }
  
	  // Hash the new password
	  const hashedPassword = await bcrypt.hash(password, 12);
  
	  // Update user's password and clear reset token
	  user.password = hashedPassword;
	  user.resetToken = undefined;
	  user.resetTokenExpiration = undefined;
	  await user.save();
  
	  res.status(200).json({ message: 'Password has been reset successfully' });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ message: 'Something went wrong, please try again later' });
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
