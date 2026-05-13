import { Request, Response } from 'express';
import { handleSweep } from '../../utils/EVM-chains/sweep/handleSweep';
import { findUserByDepositAddress } from '../../utils/findUserByDepositAddress';
import { getMainExchangeWallet } from '../../utils/EVM-chains/generateEvmAddress';

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

    await handleSweep(network, address, contractAddress, getMainExchangeWallet(network));

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('EVM Deposit Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
