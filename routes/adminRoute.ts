import { Router, Request, Response } from 'express';
import Cryptocurrency from '../models/cryptocurrencyModel';
import User from '../models/userModel';
import { protect } from '../middleware/auth';
import { restrictTo } from '../middleware/restrictTo';

const router = Router();

router.use(protect, restrictTo('admin'));

router.post('/add-crypto', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, symbol, current_price, decimals, chains } = req.body as {
      name: string;
      symbol: string;
      current_price: number;
      decimals?: number;
      chains?: unknown[];
    };

    if (!name || !symbol || current_price === undefined) {
      res.status(400).json({ status: 'fail', message: 'name, symbol, and current_price are required' });
      return;
    }

    const exists = await Cryptocurrency.findOne({ symbol: symbol.toUpperCase() });
    if (exists) {
      res.status(409).json({ status: 'fail', message: `${symbol.toUpperCase()} already exists` });
      return;
    }

    const crypto = await Cryptocurrency.create({
      name,
      symbol: symbol.toUpperCase(),
      current_price,
      decimals: decimals ?? 18,
      chains: chains ?? [],
    });

    res.status(201).json({ status: 'success', data: { crypto } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'fail', message: msg });
  }
});

router.delete('/remove-crypto/:symbol', async (req: Request, res: Response): Promise<void> => {
  try {
    const symbol = String(req.params.symbol).toUpperCase();
    const crypto = await Cryptocurrency.findOneAndDelete({ symbol });
    if (!crypto) {
      res.status(404).json({ status: 'fail', message: `${symbol} not found` });
      return;
    }
    res.status(200).json({ status: 'success', message: `${symbol} removed` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'fail', message: msg });
  }
});

router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password -resetToken');
    res.status(200).json({ status: 'success', results: users.length, data: { users } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'fail', message: msg });
  }
});

router.patch('/users/:id/role', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body as { role?: string };
    if (!role || !['user', 'admin'].includes(role)) {
      res.status(400).json({ status: 'fail', message: 'role must be "user" or "admin"' });
      return;
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'fail', message: msg });
  }
});

export default router;
