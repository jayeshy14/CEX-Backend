import { Contract, JsonRpcProvider, Wallet, parseEther, parseUnits } from 'ethers';
import { ICryptocurrency } from '../../models/cryptocurrencyModel';
import { IChain } from '../../models/chainModel';
import { getMainExchangeWalletPrivateKey } from './generateEvmAddress';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
];

export async function withdrawEVM(
  selectedCrypto: ICryptocurrency,
  recipient: string,
  amount: number,
  chain: IChain
): Promise<void> {
  const provider = new JsonRpcProvider(chain.rpcUrl);
  const wallet = new Wallet(getMainExchangeWalletPrivateKey(chain.name), provider);

  const isNative = selectedCrypto.symbol === chain.native_token;

  if (isNative) {
    const tx = await wallet.sendTransaction({
      to: recipient,
      value: parseEther(amount.toString()),
    });
    console.log(
      `Native Transfer: Sent ${amount} ${selectedCrypto.symbol} to ${recipient} on ${chain.name}. Tx: ${tx.hash}`
    );
    await tx.wait();
  } else {
    const token = chain.tokens.find((t) => t.symbol === selectedCrypto.symbol);
    if (!token) throw new Error(`Token ${selectedCrypto.symbol} not found on ${chain.name}`);

    const tokenContract = new Contract(token.contract_address, ERC20_ABI, wallet);
    const parsedAmount = parseUnits(amount.toString(), token.decimals);

    const tx = await (tokenContract.transfer as (to: string, amount: bigint) => Promise<{ hash: string; wait: () => Promise<unknown> }>)(
      recipient,
      parsedAmount
    );
    console.log(
      `ERC-20 Transfer: Sent ${amount} ${selectedCrypto.symbol} to ${recipient} on ${chain.name}. Tx: ${tx.hash}`
    );
    await tx.wait();
  }
}
