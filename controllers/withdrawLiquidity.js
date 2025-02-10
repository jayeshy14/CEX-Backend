exports.withdrawLiquidity = async (req, res) => {
    try {
        const { user_id, tokenA_id, tokenB_id } = req.body;

        // Step 1: Find the liquidity pool
        const pool = await LiquidityPool.findOne({
            tokenA_id,
            tokenB_id,
        });

        if (!pool) {
            return res.status(404).json({ status: "fail", message: "Liquidity pool not found" });
        }

        // Step 2: Find the user's contribution
        const userContribution = pool.contributors.find(
            (contributor) => contributor.user_id.toString() === user_id
        );

        if (!userContribution) {
            return res.status(400).json({ status: "fail", message: "No contributions found for the user" });
        }

        // Step 3: Calculate user's share of the pool
        const totalReserveA = pool.reserveA;
        const totalReserveB = pool.reserveB;

        const userShareA = (userContribution.amountA / totalReserveA) * pool.reserveA;
        const userShareB = (userContribution.amountB / totalReserveB) * pool.reserveB;

        // Step 4: Deduct from pool reserves and remove user contribution
        pool.reserveA -= userShareA;
        pool.reserveB -= userShareB;

        pool.contributors = pool.contributors.filter(
            (contributor) => contributor.user_id.toString() !== user_id
        );

        await pool.save();

        // Step 5: Update user's wallet
        const wallet = await Wallet.findOne({ user_id });
        if (!wallet) {
            return res.status(404).json({ status: "fail", message: "Wallet not found" });
        }

        const tokenA = await WalletCryptocurrency.findOne({
            wallet_id: wallet._id,
            cryptocurrency_id: tokenA_id,
        });

        const tokenB = await WalletCryptocurrency.findOne({
            wallet_id: wallet._id,
            cryptocurrency_id: tokenB_id,
        });

        tokenA.cryptocurrency_amount += userShareA;
        tokenB.cryptocurrency_amount += userShareB;

        await tokenA.save();
        await tokenB.save();

        res.status(200).json({
            status: "success",
            message: "Liquidity withdrawn successfully",
            data: {
                withdrawn: { amountA: userShareA, amountB: userShareB },
                newReserves: { reserveA: pool.reserveA, reserveB: pool.reserveB },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "fail", message: "Internal server error" });
    }
};
