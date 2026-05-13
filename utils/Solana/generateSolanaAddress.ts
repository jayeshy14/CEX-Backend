import * as bip39 from 'bip39';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { derivePath } from 'ed25519-hd-key';
import { getMnemonic } from '../deposits/getMnemonic';

export const getSolanaPrivateKey = (userId: string | number, chainName: string): Buffer => {
  const mnemonic = getMnemonic(chainName);
  if (!mnemonic) throw new Error('Mnemonic not found for chain');

  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');

  const hashedUserId = parseInt(Buffer.from(userId.toString()).toString('hex').slice(0, 8), 16);
  const userIndex = hashedUserId % 100000;

  const derivationPath = `m/44'/501'/${userIndex}'/0'`;
  console.log('Using derivation path:', derivationPath);

  const { key } = derivePath(derivationPath, seed);
  if (!key) throw new Error('derivePath failed, check seed or derivation path');

  return key;
};

export const getMainSolanaPrivateKey = (chainName: string): Buffer => {
  const mnemonic = getMnemonic(chainName);
  if (!mnemonic) throw new Error('Mnemonic not found for chain');

  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');

  const derivationPath = `m/44'/501'/0'/0'`;
  console.log('Deriving Main Exchange Wallet at:', derivationPath);

  const { key } = derivePath(derivationPath, seed);
  if (!key) throw new Error('derivePath failed for main wallet');

  return key;
};

// Alias matching the import name used by withdrawSolana.ts in the original code.
export const getMainExchangeWalletPrivateKey = getMainSolanaPrivateKey;

export const getSolanaAddress = (userId: string | number, chainName: string): string => {
  const privateKey = getSolanaPrivateKey(userId, chainName);
  const keypair = nacl.sign.keyPair.fromSeed(privateKey);
  const publicKey = bs58.encode(Buffer.from(keypair.publicKey));

  console.log("User's Solana Deposit Address:", publicKey);
  return publicKey;
};

export const getMainExchangeWallet = (chainName: string): string => {
  const privateKey = getMainSolanaPrivateKey(chainName);
  const keypair = nacl.sign.keyPair.fromSeed(privateKey);
  const publicKey = bs58.encode(Buffer.from(keypair.publicKey));

  console.log('Main Exchange Solana Wallet Address:', publicKey);
  return publicKey;
};
