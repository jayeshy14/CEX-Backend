import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

export async function sweepOtherTokens(
  connection: Connection,
  depositWallet: PublicKey,
  tokenMint: string,
  mainExchangeWallet: string
): Promise<void> {
  try {
    const tokenMintPubkey = new PublicKey(tokenMint);
    const depositTokenAccount = await getAssociatedTokenAddress(tokenMintPubkey, depositWallet);
    const mainExchangeTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey,
      new PublicKey(mainExchangeWallet)
    );

    const balance = await connection.getTokenAccountBalance(depositTokenAccount);
    const amount = BigInt(balance.value.amount);

    if (amount <= 0n) {
      console.log(`No SPL tokens (${tokenMint}) in ${depositWallet.toBase58()}`);
      return;
    }

    const transaction = new Transaction().add(
      createTransferInstruction(depositTokenAccount, mainExchangeTokenAccount, depositWallet, amount)
    );

    // Signing requires a Keypair; this sweep stub does not have access to the
    // deposit-wallet private key. Callers should derive and sign separately.
    console.log(`Would sweep ${amount.toString()} SPL tokens to main wallet (signing skipped)`);
    void transaction;
  } catch (error) {
    console.error('SPL Token Sweep Error:', error);
  }
}
