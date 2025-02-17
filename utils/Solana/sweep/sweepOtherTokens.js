const { PublicKey, Transaction, sendAndConfirmTransaction } = require("@solana/web3.js");
const { getAssociatedTokenAddress, createTransferInstruction } = require("@solana/spl-token");

async function sweepOtherTokens(connection, depositWallet, tokenMint, mainExchangeWallet) {
    try {
        const tokenMintPubkey = new PublicKey(tokenMint);
        const depositTokenAccount = await getAssociatedTokenAddress(tokenMintPubkey, depositWallet.publicKey);
        const mainExchangeTokenAccount = await getAssociatedTokenAddress(tokenMintPubkey, new PublicKey(mainExchangeWallet));

        const balance = await connection.getTokenAccountBalance(depositTokenAccount);
        const amount = balance.value.amount;

        if (amount <= 0) {
            console.log(`No SPL tokens (${tokenMint}) in ${depositWallet.publicKey.toBase58()}`);
            return;
        }

        const transaction = new Transaction().add(
            createTransferInstruction(depositTokenAccount, mainExchangeTokenAccount, depositWallet.publicKey, amount)
        );

        const signature = await sendAndConfirmTransaction(connection, transaction, [depositWallet]);
        console.log(`Swept ${amount} SPL tokens to main wallet: ${signature}`);
    } catch (error) {
        console.error("SPL Token Sweep Error:", error);
    }
}

module.exports = { sweepOtherTokens };
