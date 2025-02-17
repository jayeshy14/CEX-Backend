const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    chain: [{ type: mongoose.Schema.Types.ObjectId, ref: "chains" }]
}, { timestamps: true });

const User = mongoose.model("users", userSchema);
module.exports = User;
