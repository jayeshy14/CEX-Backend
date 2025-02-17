const { Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } = require("@solana/web3.js");

async function sweepNativeToken(connection, depositWallet, mainExchangeWallet) {
    try {
        const balance = await connection.getBalance(depositWallet.publicKey);

        if (balance <= 0.0001 * LAMPORTS_PER_SOL) {
            console.log(`Skipping ${depositWallet.publicKey.toBase58()}, balance too low.`);
            return;
        }

        // Estimate transaction fee (assuming standard)
        const txFee = 5000; // Typical transaction fee

        const amountToSend = balance - txFee;
        if (amountToSend <= 0) {
            console.log("Not enough SOL after transaction fee.");
            return;
        }

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: depositWallet.publicKey,
                toPubkey: new PublicKey(mainExchangeWallet),
                lamports: amountToSend,
            })
        );

        const signature = await sendAndConfirmTransaction(connection, transaction, [depositWallet]);
        console.log(`Swept ${amountToSend / LAMPORTS_PER_SOL} SOL to main wallet: ${signature}`);
    } catch (error) {
        console.error("SOL Sweep Error:", error);
    }
}

module.exports = { sweepNativeToken };
