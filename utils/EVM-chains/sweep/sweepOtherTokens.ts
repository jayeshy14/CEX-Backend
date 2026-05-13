import { Contract, Wallet } from 'ethers';
import { getEthereumProvider } from '../getEthereumProvider';
import { getMainExchangeWallet } from '../generateEvmAddress';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export async function sweepOtherTokens(
  chainName: string,
  depositPrivateKey: string,
  contractAddress: string
): Promise<void> {
  try {
    const provider = getEthereumProvider(chainName);
    const depositWallet = new Wallet(depositPrivateKey, provider);
    const mainExchangeWallet = getMainExchangeWallet(chainName);

    const tokenContract = new Contract(contractAddress, ERC20_ABI, depositWallet);

    const balance = (await (tokenContract.balanceOf as (a: string) => Promise<bigint>)(
      depositWallet.address
    )) as bigint;
    if (balance <= 0n) {
      console.log(`No ${contractAddress} tokens in ${depositWallet.address}`);
      return;
    }

    const tx = await (tokenContract.transfer as (to: string, amount: bigint) => Promise<{ hash: string }>)(
      mainExchangeWallet,
      balance
    );
    console.log(`Swept ${balance.toString()} ERC-20 tokens to main wallet: ${tx.hash}`);
  } catch (error) {
    console.error('ERC-20 Sweep Error:', error);
  }
}
