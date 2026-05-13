import { Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import { handleSweep } from '../../utils/Solana/sweep/handleSweep';
import { findUserByDepositAddress } from '../../utils/findUserByDepositAddress';
import { getMainExchangeWallet } from '../../utils/Solana/generateSolanaAddress';
import Wallet from '../../models/walletModel';
import Chain from '../../models/chainModel';

export const handleSolanaDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address, value, contractAddress, network } = req.body.event as {
      address: string;
      value: number;
      contractAddress?: string;
      network: string;
    };

    console.log(`Solana Deposit Detected: ${value} on ${address} (${network})`);

    const depositPubkey = new PublicKey(address);
    const canonicalAddress = depositPubkey.toBase58();

    const user = await findUserByDepositAddress(canonicalAddress);
    if (!user) {
      console.warn('Unknown deposit address:', address);
      res.status(400).json({ error: 'Unknown address' });
      return;
    }

    // Resolve token symbol
    const chain = await Chain.findOne({ name: { $regex: /solana/i } });
    let symbol = chain?.native_token ?? 'SOL';
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

    await handleSweep(network, depositPubkey, contractAddress, getMainExchangeWallet(network));

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Solana Deposit Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
