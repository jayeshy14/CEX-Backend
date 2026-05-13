import { Connection, PublicKey } from '@solana/web3.js';
import { sweepNativeToken } from './sweepNativeToken';
import { sweepOtherTokens } from './sweepOtherTokens';

export async function handleSweep(
  rpcUrl: string,
  depositWallet: PublicKey,
  contractAddress: string | undefined,
  mainExchangeWallet: string
): Promise<void> {
  const connection = new Connection(rpcUrl, 'confirmed');

  if (!contractAddress) {
    await sweepNativeToken(connection, depositWallet, mainExchangeWallet);
  } else {
    await sweepOtherTokens(connection, depositWallet, contractAddress, mainExchangeWallet);
  }
}
