const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const LiquidityPool = require("../models/liquidityPoolModel");
const WalletCryptocurrency = require("../models/walletCryptocurrencyModel");

exports.addLiquidity = async (req, res) => {
    try {
        const { user_id, tokenA_id, tokenB_id, amountA, amountB } = req.body;

        // Step 1: Fetch user and validate wallet
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ status: "fail", message: "User not found" });
        }

        const wallet = await Wallet.findOne({ user_id: user._id });
        if (!wallet) {
            return res.status(404).json({ status: "fail", message: "Wallet not found" });
        }

        // Step 2: Check user balances
        const tokenA = await WalletCryptocurrency.findOne({
            wallet_id: wallet._id,
            cryptocurrency_id: tokenA_id,
        });

        const tokenB = await WalletCryptocurrency.findOne({
            wallet_id: wallet._id,
            cryptocurrency_id: tokenB_id,
        });

        if (!tokenA || tokenA.cryptocurrency_amount < amountA) {
            return res.status(400).json({ status: "fail", message: "Insufficient token A balance" });
        }

        if (!tokenB || tokenB.cryptocurrency_amount < amountB) {
            return res.status(400).json({ status: "fail", message: "Insufficient token B balance" });
        }

        // Step 3: Check if the liquidity pool exists (create if it doesn't)
        let pool = await LiquidityPool.findOne({
            tokenA_id,
            tokenB_id,
        });

        if (!pool) {
            pool = await LiquidityPool.create({
                tokenA_id,
                tokenB_id,
                reserveA: 0,
                reserveB: 0,
                contributors: [],
            });
        }

        // Step 4: Update pool reserves and user balances
        tokenA.cryptocurrency_amount -= amountA;
        tokenB.cryptocurrency_amount -= amountB;
        await tokenA.save();
        await tokenB.save();

        // Update pool reserves
        pool.reserveA += amountA;
        pool.reserveB += amountB;

        // Step 5: Track user contributions
        const existingContribution = pool.contributors.find(
            (contributor) => contributor.user_id.toString() === user_id
        );

        if (existingContribution) {
            existingContribution.amountA += amountA;
            existingContribution.amountB += amountB;
        } else {
            pool.contributors.push({
                user_id,
                amountA,
                amountB,
            });
        }

        await pool.save();

        res.status(200).json({
            status: "success",
            message: "Liquidity added successfully",
            data: {
                newReserves: { reserveA: pool.reserveA, reserveB: pool.reserveB },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "fail", message: "Internal server error" });
    }
};
