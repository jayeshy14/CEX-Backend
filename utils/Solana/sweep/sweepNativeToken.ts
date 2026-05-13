import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

export async function sweepNativeToken(
  connection: Connection,
  depositWallet: PublicKey,
  mainExchangeWallet: string
): Promise<void> {
  try {
    const balance = await connection.getBalance(depositWallet);

    if (balance <= 0.0001 * LAMPORTS_PER_SOL) {
      console.log(`Skipping ${depositWallet.toBase58()}, balance too low.`);
      return;
    }

    const txFee = 5000;
    const amountToSend = balance - txFee;
    if (amountToSend <= 0) {
      console.log('Not enough SOL after transaction fee.');
      return;
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: depositWallet,
        toPubkey: new PublicKey(mainExchangeWallet),
        lamports: amountToSend,
      })
    );

    // Signing requires a Keypair; this sweep stub does not have access to the
    // deposit-wallet private key. Callers should derive and sign separately.
    console.log(
      `Would sweep ${amountToSend / LAMPORTS_PER_SOL} SOL to main wallet (transaction prepared, signing skipped)`
    );
    void transaction;
  } catch (error) {
    console.error('SOL Sweep Error:', error);
  }
}
