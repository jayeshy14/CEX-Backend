import Chain from '../../models/chainModel';

export const getAllDepositAddresses = async (chain: string): Promise<string[]> => {
  const chainDoc = await Chain.findOne({ name: chain });
  if (!chainDoc) {
    throw new Error('Chain not found');
  }
  return chainDoc.deposit_addresses;
};
