import { Request, Response } from 'express';
import { handleSweep } from '../../utils/BTC/sweep/handleSweep';
import { findUserByDepositAddress } from '../../utils/findUserByDepositAddress';
import { getMainExchangeWallet } from '../../utils/BTC/generateBtcAddress';

export const handleBitcoinDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address, value, network } = req.body.event as {
      address: string;
      value: number;
      network: string;
    };

    console.log(`Bitcoin Deposit Detected: ${value} BTC on ${address} (${network})`);

    const user = await findUserByDepositAddress(address);
    if (!user) {
      console.warn('Unknown deposit address:', address);
      res.status(400).json({ error: 'Unknown address' });
      return;
    }

    await handleSweep(network, address, getMainExchangeWallet(network));

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Bitcoin Deposit Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
