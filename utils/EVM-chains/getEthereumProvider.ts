import { JsonRpcProvider } from 'ethers';

const RPC_URLS: Record<string, string> = {
  ETHEREUM: process.env.RPC_URL_ETHEREUM ?? '',
  BSC: process.env.RPC_URL_BSC ?? '',
  POLYGON: process.env.RPC_URL_POLYGON ?? '',
};

export const getEthereumProvider = (chainName: string): JsonRpcProvider => {
  const url = RPC_URLS[chainName.toUpperCase()] ?? process.env.RPC_URL_ETHEREUM ?? '';
  return new JsonRpcProvider(url);
};

// Backwards-compatible export for older callers.
export const ethereumProvider = new JsonRpcProvider(process.env.RPC_URL_ETHEREUM ?? '');
