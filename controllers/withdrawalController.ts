import { Request, Response } from 'express';
import Wallet from '../models/walletModel';
import Cryptocurrency from '../models/cryptocurrencyModel';
import Chain from '../models/chainModel';
import TokenWithdrawal from '../models/tokenWithdrawalModel';
import { withdrawEVM } from '../utils/EVM-chains/withdrawEvm';

export const handleWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { toAddress, amount, symbol, chainName } = req.body as {
      toAddress?: string;
      amount?: number;
      symbol?: string;
      chainName?: string;
    };

    if (!toAddress || !amount || !symbol || !chainName) {
      res.status(400).json({ error: 'Missing required fields: toAddress, amount, symbol, chainName' });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ error: 'Amount must be positive' });
      return;
    }

    const userId = req.user!._id;

    const [wallet, crypto, chain] = await Promise.all([
      Wallet.findOne({ user_id: userId }),
      Cryptocurrency.findOne({ symbol }),
      Chain.findOne({ name: { $regex: new RegExp(chainName, 'i') } }),
    ]);

    if (!wallet) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }
    if (!crypto) {
      res.status(404).json({ error: `Cryptocurrency ${symbol} not found` });
      return;
    }
    if (!chain) {
      res.status(404).json({ error: `Chain ${chainName} not found` });
      return;
    }

    const currentBalance = wallet.balances.get(symbol) ?? 0;
    if (currentBalance < amount) {
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    const withdrawal = await TokenWithdrawal.create({
      user_id: userId,
      to_address: toAddress,
      amount,
      status: 'pending',
    });

    // Debit balance before sending — prevents double-spend on retry
    wallet.balances.set(symbol, currentBalance - amount);
    await wallet.save();

    try {
      await withdrawEVM(crypto, toAddress, amount, chain);
      withdrawal.status = 'completed';
    } catch (sendError) {
      // Refund on send failure
      wallet.balances.set(symbol, (wallet.balances.get(symbol) ?? 0) + amount);
      await wallet.save();
      withdrawal.status = 'failed';
      await withdrawal.save();
      throw sendError;
    }

    await withdrawal.save();
    res.status(200).json({ success: true, withdrawalId: withdrawal._id });
  } catch (error) {
    console.error('Withdrawal Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
