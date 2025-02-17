const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String, unique: true, required: false }, // Optional for Google users
    email: { type: String, unique: true, required: true },
    password: { type: String, required: false }, // Optional for Google users
    googleId: { type: String, required: false }, // Google ID for Google login users
    role: { type: String, default: 'user' }, // Default role is 'user'
    chain: [{ type: mongoose.Schema.Types.ObjectId, ref: "chains" }],
    resetToken: { type: String, required: false }, // Token for password reset
    resetTokenExpiration: { type: Date, required: false }, // Expiration date for reset token
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);
module.exports = User;
