const User = require("../models/userModel");
const Chain = require("../models/chainModel");

const findUserByDepositAddress = async (address) => {
    const chain = await Chain.findOne({ deposit_addresses: { $in: [address] } });
    if (!chain) {
        throw new Error("Chain not found");
    }

    const user = await User.findOne({ chain: chain._id });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

module.exports = { findUserByDepositAddress };
