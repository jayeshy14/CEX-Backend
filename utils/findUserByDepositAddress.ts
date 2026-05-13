import User, { IUser } from '../models/userModel';
import Chain from '../models/chainModel';

export const findUserByDepositAddress = async (address: string): Promise<IUser | null> => {
  const chain = await Chain.findOne({ deposit_addresses: { $in: [address] } });
  if (!chain) {
    throw new Error('Chain not found');
  }

  const user = await User.findOne({ chain: chain._id });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
