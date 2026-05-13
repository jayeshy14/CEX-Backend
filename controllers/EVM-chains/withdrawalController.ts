import { Request, Response } from 'express';
import User from '../../models/userModel';

// Stub: not fully implemented.
export const handleWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { useraddress, amount, chain } = req.body as {
      useraddress?: string;
      amount?: number;
      chain?: string;
    };
    const user = useraddress ? await User.findOne({ email: useraddress }) : null;
    console.log('EVM withdrawal stub received:', { user, amount, chain });
    res.status(501).json({ error: 'Not implemented' });
  } catch (error) {
    console.error('Withdrawal Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
