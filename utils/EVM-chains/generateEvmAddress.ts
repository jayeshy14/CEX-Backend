import { HDNodeWallet, keccak256, Mnemonic, Wallet } from 'ethers';
import { getMnemonic } from '../deposits/getMnemonic';

const EXCHANGE_WALLETS: Record<string, string | undefined> = {
  ETHEREUM: process.env.EXCHANGE_ETHEREUM_MNEMONIC,
  BSC: process.env.EXCHANGE_BSC_MNEMONIC,
};

export const getEVMPrivateKey = (userId: string | number, chainName: string): string => {
  const mnemonic = getMnemonic(chainName);
  if (!mnemonic) {
    throw new Error(`Mnemonic not found for ${chainName}`);
  }

  const hashedUserId = keccak256(Buffer.from(userId.toString())).slice(2, 10);
  const userIndex = parseInt(hashedUserId, 16) % 10000;

  const derivationPath = `m/44'/60'/0'/0/${userIndex}`;

  const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic), derivationPath);
  return wallet.privateKey;
};

export const getMainExchangeWalletPrivateKey = (chainName: string): string => {
  const mnemonic = EXCHANGE_WALLETS[chainName.toUpperCase()];
  if (!mnemonic) {
    throw new Error(`Exchange Mnemonic not found for ${chainName}`);
  }
  return getEVMPrivateKey(0, chainName);
};

export const getEVMAddress = (userId: string | number, chainName: string): string => {
  const privateKey = getEVMPrivateKey(userId, chainName);
  return new Wallet(privateKey).address;
};

export const getMainExchangeWallet = (chainName: string): string => {
  const mnemonic = EXCHANGE_WALLETS[chainName.toUpperCase()];
  if (!mnemonic) {
    throw new Error(`Exchange Mnemonic not found for ${chainName}`);
  }
  const derivationPath = `m/44'/60'/0'/0/0`;
  const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic), derivationPath);
  return wallet.address;
};
