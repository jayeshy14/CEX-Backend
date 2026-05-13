import { Contract, JsonRpcProvider, Wallet, parseEther } from 'ethers';

const TOKEN_ABI = ['function transfer(address to, uint256 amount) public returns (bool)'];

export const sendTokens = async (
  toAddress: string,
  amount: number,
  tokenAddress: string
): Promise<unknown> => {
  try {
    const provider = new JsonRpcProvider(process.env.RPC_URL ?? '');
    const wallet = new Wallet(process.env.PRIVATE_KEY ?? '', provider);

    const contractInstance = new Contract(tokenAddress, TOKEN_ABI, wallet);
    const tokenAmount = parseEther(amount.toString());

    const tx = await (contractInstance.transfer as (to: string, amount: bigint) => Promise<{ hash: string; wait: () => Promise<unknown> }>)(
      toAddress,
      tokenAmount
    );
    console.log('Transaction Hash:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction Receipt:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error sending tokens:', error);
    throw new Error('Failed to process withdrawal');
  }
};
