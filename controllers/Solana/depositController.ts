import { Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import { handleSweep } from '../../utils/Solana/sweep/handleSweep';
import { findUserByDepositAddress } from '../../utils/findUserByDepositAddress';
import { getMainExchangeWallet } from '../../utils/Solana/generateSolanaAddress';

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

    const user = await findUserByDepositAddress(depositPubkey.toBase58());
    if (!user) {
      console.warn('Unknown deposit address:', address);
      res.status(400).json({ error: 'Unknown address' });
      return;
    }

    await handleSweep(network, depositPubkey, contractAddress, getMainExchangeWallet(network));

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Solana Deposit Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
