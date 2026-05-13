import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Wallet from '../models/walletModel';
import { getEVMAddress } from '../utils/EVM-chains/generateEvmAddress';
import { getSolanaAddress } from '../utils/Solana/generateSolanaAddress';
import { getBTCAddress } from '../utils/BTC/generateBtcAddress';

export const getOrGenerateDepositAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received request body:', req.body);

    const { userId, selectedCrypto, selectedChain } = req.body as {
      userId?: string;
      selectedCrypto?: string;
      selectedChain?: string;
    };

    if (!userId || !selectedCrypto || !selectedChain) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    console.log('Parsed values:', { userId, selectedCrypto, selectedChain });

    let wallet = await Wallet.findOne({ user_id: userId });

    if (!wallet) {
      wallet = new Wallet({ user_id: userId, chains: [] });
    }

    let depositAddress: string | null = null;

    const chainEntry = wallet.chains.find((c) => c.chain.toString() === selectedChain);
    if (chainEntry) {
      depositAddress = chainEntry.address;
    }

    console.log('Chain after parsing:', selectedChain);

    if (!depositAddress) {
      switch (selectedChain.toUpperCase()) {
        case 'ETHEREUM':
        case 'BSC':
          depositAddress = getEVMAddress(userId, selectedChain);
          break;
        case 'SOLANA':
          depositAddress = getSolanaAddress(userId, selectedChain);
          break;
        case 'BITCOIN':
          depositAddress = await getBTCAddress(userId, selectedChain);
          break;
        default:
          res.status(400).json({ error: 'Unsupported blockchain' });
          return;
      }

      wallet.chains.push({
        chain: new Types.ObjectId(selectedChain),
        address: depositAddress,
      });
      await wallet.save();
    }

    res.json({ depositAddress });
  } catch (error) {
    console.error('Error generating deposit address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
