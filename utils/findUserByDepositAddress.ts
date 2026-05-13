import User, { IUser } from '../models/userModel';
import Wallet from '../models/walletModel';

export const findUserByDepositAddress = async (address: string): Promise<IUser | null> => {
  const wallet = await Wallet.findOne({ 'chains.address': address });
  if (!wallet) return null;

  return User.findById(wallet.user_id);
};
