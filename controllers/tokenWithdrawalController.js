const User = require("../models/userModel");

exports.withdrawToken = async (req, res) => {
    // #swagger.tags = ["TokenWithdrawal"]
    // #swagger.summary = "Withdraw token"
    try {
        const { user_id, amount, token_id} = req.body;
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found",
            });
        }

        const wallet = await user.getWallet();

        if (!wallet) {
            return res.status(404).json({
                status: "fail",
                message: "Wallet not found",
            });
        }

        // Validate input
        if (!user_id || !amount || !token_id || !to_address) {
            return res.status(400).json({
                status: "fail",
                message: "Missing required fields",
            });
        }

        // Fetch user's wallet cryptocurrency
        const walletCrypto = await WalletCryptocurrency.findOne({
            user_id,
            cryptocurrency_id: token_id,
        });

        if (!walletCrypto || walletCrypto.cryptocurrency_amount < amount) {
            return res.status(400).json({
                status: "fail",
                message: "Insufficient balance",
            });
        }

        // Perform the token transfer
        const receipt = await sendTokens(
            to_address,
            amount,
            "TOKEN_CONTRACT_ADDRESS", 
        );

        // Deduct the balance from user's wallet
        walletCrypto.cryptocurrency_amount -= amount;
        await walletCrypto.save();

        await Withdrawal.create({
            user_id,
            to_address,
            amount,
            token_id,
            status: "completed",
            tx_hash: receipt.transactionHash,
        });


        res.status(200).json({
            status: "success",
            message: "Token withdrawal successful",
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
        });
    }
}