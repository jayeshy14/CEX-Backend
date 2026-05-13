import { Request, Response } from 'express';
import { handleSweep } from '../../utils/EVM-chains/sweep/handleSweep';
import { findUserByDepositAddress } from '../../utils/findUserByDepositAddress';
import { getMainExchangeWallet } from '../../utils/EVM-chains/generateEvmAddress';
import Wallet from '../../models/walletModel';
import Chain from '../../models/chainModel';

export const handleEvmDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address, value, contractAddress, network } = req.body.event as {
      address: string;
      value: number;
      contractAddress?: string;
      network: string;
    };

    console.log(`EVM Deposit Detected: ${value} on ${address} (${network})`);

    const user = await findUserByDepositAddress(address);
    if (!user) {
      console.warn('Unknown deposit address:', address);
      res.status(400).json({ error: 'Unknown address' });
      return;
    }

    // Resolve token symbol
    const chain = await Chain.findOne({ name: { $regex: new RegExp(network, 'i') } });
    let symbol = chain?.native_token ?? 'ETH';
    if (contractAddress && chain) {
      const token = chain.tokens.find(
        (t) => t.contract_address.toLowerCase() === contractAddress.toLowerCase()
      );
      if (token) symbol = token.symbol;
    }

    // Credit user balance
    const wallet = await Wallet.findOne({ user_id: user._id });
    if (wallet) {
      wallet.balances.set(symbol, (wallet.balances.get(symbol) ?? 0) + value);
      await wallet.save();
      console.log(`Credited ${value} ${symbol} to user ${user._id.toString()}`);
    }

    await handleSweep(network, address, contractAddress, getMainExchangeWallet(network));

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('EVM Deposit Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
