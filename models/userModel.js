//userModel.js
const mongoose = require("mongoose");
const Wallets = require("./walletModel");

const userSchema = new mongoose.Schema({
	first_name: { type: String, required: true},
  last_name: {type: String, required: true},
  phone_number: {type: String, unique: true, required: true},
  email: { type: String, unique: true, require: true},
  password: { type: String, required: true},
})

const User = mongoose.model('users', userSchema);

// Method getWallet
User.prototype.getWallet = async function() {
  // Find user's wallet
  const wallet = await Wallets.find({
    user_id: this._id,
  });

  return wallet;
}

module.exports = User; 