import { sweepNativeToken } from './sweepNativeToken';
import { sweepOtherTokens } from './sweepOtherTokens';

export async function handleSweep(
  chainName: string,
  depositAddress: string,
  contractAddress: string | undefined,
  mainExchangeWallet: string
): Promise<void> {
  if (!contractAddress) {
    await sweepNativeToken(chainName, depositAddress, mainExchangeWallet);
  } else {
    await sweepOtherTokens(chainName, depositAddress, contractAddress);
  }
}
