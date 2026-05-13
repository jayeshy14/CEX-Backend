import { formatEther, parseEther, Wallet } from 'ethers';
import { getEthereumProvider } from '../getEthereumProvider';

export const sweepNativeToken = async (
  chainName: string,
  depositPrivateKey: string,
  mainExchangeWallet: string
): Promise<void> => {
  try {
    const provider = getEthereumProvider(chainName);
    const depositWallet = new Wallet(depositPrivateKey, provider);

    const balance = await provider.getBalance(depositWallet.address);
    const threshold = parseEther('0.0001');
    if (balance <= threshold) {
      console.log(`Skipping ${depositWallet.address}, balance too low.`);
      return;
    }

    const gasLimit = 21000n;
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice ?? 0n;
    const txValue = balance - gasPrice * gasLimit;

    const tx = await depositWallet.sendTransaction({
      to: mainExchangeWallet,
      value: txValue,
      gasLimit,
    });

    console.log(`Swept ${formatEther(txValue)} native tokens to main wallet: ${tx.hash}`);
  } catch (error) {
    console.error('Native Token Sweep Error:', error);
  }
};
