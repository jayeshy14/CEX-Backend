

exports.handleWithdrawal = async (req, res) => {
    try {
        const { useraddress, amount, chain } = req.body;
        const user = await User.findOne({ address });
    } catch (error) {
        console.error("🚨 Withdrawal Handler Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}