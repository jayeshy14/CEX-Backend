import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import nacl from 'tweetnacl';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from '@solana/spl-token';
import { ICryptocurrency } from '../../models/cryptocurrencyModel';
import { getMainExchangeWalletPrivateKey } from './generateSolanaAddress';

export async function withdrawSolana(
  selectedCrypto: ICryptocurrency,
  recipient: string,
  amount: number
): Promise<string> {
  const solanaRpcUrl = process.env.RPC_URL_SOLANA ?? 'https://api.devnet.solana.com';
  const connection = new Connection(solanaRpcUrl, 'confirmed');

  const seed = getMainExchangeWalletPrivateKey('SOLANA');
  const keypair = nacl.sign.keyPair.fromSeed(seed);
  const senderKeypair = Keypair.fromSecretKey(keypair.secretKey);

  const isNative = selectedCrypto.symbol === 'SOL';
  const instructions = [];

  if (isNative) {
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: new PublicKey(recipient),
        lamports: amount * 1e9,
      })
    );
  } else {
    const token = selectedCrypto.chains.find((c) => c.chain_name === 'SOLANA');
    if (!token) throw new Error(`Token ${selectedCrypto.symbol} not found on Solana`);

    const mintAddress = new PublicKey(token.contract_address);
    const recipientPublicKey = new PublicKey(recipient);

    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      mintAddress,
      senderKeypair.publicKey
    );

    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      mintAddress,
      recipientPublicKey
    );

    instructions.push(
      createTransferInstruction(
        senderTokenAccount.address,
        recipientTokenAccount.address,
        senderKeypair.publicKey,
        amount * 10 ** selectedCrypto.decimals
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
    preflightCommitment: 'confirmed',
  });

  console.log(`Sent ${amount} ${selectedCrypto.symbol} to ${recipient} | Tx: https://solscan.io/tx/${signature}`);
  return signature;
}
