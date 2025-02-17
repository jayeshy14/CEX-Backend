const { 
    Connection, Keypair, PublicKey, Transaction, SystemProgram, 
    VersionedTransaction, TransactionMessage 
} = require("@solana/web3.js");
const { getMainExchangeWalletPrivateKey } = require("./generateSolanaAddress");
const { 
    getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID 
} = require("@solana/spl-token");

async function withdrawSolana(selectedCrypto, recipient, amount) {
    const solanaRpcUrl = "https://api.devnet.solana.com"; 
    const connection = new Connection(solanaRpcUrl, "confirmed");

    const senderKeypair = Keypair.fromSecretKey(Buffer.from(getMainExchangeWalletPrivateKey("SOLANA"), "hex"));

    const isNative = selectedCrypto.symbol === "SOL";
    let instructions = [];

    if (isNative) {
        instructions.push(
            SystemProgram.transfer({
                fromPubkey: senderKeypair.publicKey,
                toPubkey: new PublicKey(recipient),
                lamports: amount * 1e9,
            })
        );
    } else {
        const token = selectedCrypto.chains.find(c => c.chain_name === "SOLANA");
        if (!token) throw new Error(`Token ${selectedCrypto.symbol} not found on Solana`);

        const mintAddress = new PublicKey(token.contract_address);
        const recipientPublicKey = new PublicKey(recipient);

        // Get or Create Sender's Associated Token Account (ATA)
        const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            senderKeypair,
            mintAddress,
            senderKeypair.publicKey
        );

        // Get or Create Recipient's Associated Token Account (ATA)
        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            senderKeypair, // The payer (sender) creates the recipient's ATA if it doesn't exist
            mintAddress,
            recipientPublicKey
        );

        instructions.push(
            createTransferInstruction(
                senderTokenAccount.address,  // Sender ATA
                recipientTokenAccount.address,  // Recipient ATA
                senderKeypair.publicKey,  // Owner of sender ATA
                amount * 10 ** token.decimals  // Convert amount to token's smallest unit
            )
        );
    }

    const latestBlockhash = await connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
        payerKey: senderKeypair.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([senderKeypair]);

    const signature = await connection.sendTransaction(transaction, {
        skipPreflight: false, 
        preflightCommitment: "confirmed",
    });

    console.log(`✅ Sent ${amount} ${selectedCrypto.symbol} to ${recipient} | Tx: https://solscan.io/tx/${signature}`);
    return signature;
}

module.exports = { withdrawSolana };
