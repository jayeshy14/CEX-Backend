import { Request, Response } from 'express';
import Wallet from '../models/walletModel';

export const getAllWallets = async (_req: Request, res: Response): Promise<void> => {
  try {
    const wallets = await Wallet.find();
    res.status(200).json({ status: 'success', results: wallets.length, data: { wallets } });
  } catch {
    res.status(400).json({ status: 'fail' });
  }
};

export const getOneWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) {
      res.status(404).json({ status: 'fail', message: 'Wallet not found' });
      return;
    }
    res.status(200).json({ status: 'success', data: { wallet } });
  } catch {
    res.status(400).json({ status: 'fail' });
  }
};

export const createWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const wallet = await Wallet.create({ ...req.body });
    res.status(201).json({ status: 'success', data: { wallet } });
  } catch {
    res.status(400).json({ status: 'fail' });
  }
};

export const updateWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const wallet = await Wallet.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!wallet) {
      res.status(404).json({ status: 'fail', message: 'Wallet not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: { wallet } });
  } catch {
    res.status(400).json({ status: 'fail' });
  }
};

export const deleteWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) {
      res.status(404).json({ status: 'fail', message: 'Wallet not found' });
      return;
    }
    await Wallet.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success' });
  } catch {
    res.status(400).json({ status: 'fail' });
  }
};
