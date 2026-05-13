import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chain from './models/chainModel';
import Cryptocurrency from './models/cryptocurrencyModel';

dotenv.config();

const chains = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
    chain_id: 1,
    native_token: 'ETH',
    exchange_wallet_address: '0x0000000000000000000000000000000000000000',
    rpcUrl: process.env.RPC_URL_ETHEREUM ?? 'https://mainnet.infura.io/v3/YOUR_KEY',
    explorerUrl: 'https://etherscan.io',
    tokens: [],
    deposit_addresses: [],
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    // Solana isn't EVM; use 0 as a sentinel to satisfy the required Number field.
    chain_id: 0,
    native_token: 'SOL',
    exchange_wallet_address: '11111111111111111111111111111111',
    rpcUrl: process.env.RPC_URL_SOLANA ?? 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    tokens: [],
    deposit_addresses: [],
  },
];

const cryptocurrencies = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
    current_price: 3000,
    decimals: 18,
    chains: [
      {
        chain_name: 'Ethereum',
        wallet_address: '0x0000000000000000000000000000000000000000',
        contract_address: '',
        supply: 0,
      },
    ],
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    current_price: 150,
    decimals: 9,
    chains: [
      {
        chain_name: 'Solana',
        wallet_address: '11111111111111111111111111111111',
        contract_address: '',
        supply: 0,
      },
    ],
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    current_price: 1,
    decimals: 6,
    chains: [
      {
        chain_name: 'Ethereum',
        wallet_address: '0x0000000000000000000000000000000000000000',
        contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        supply: 0,
      },
    ],
  },
];

const main = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not configured');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  await Chain.deleteMany({});
  await Cryptocurrency.deleteMany({});

  await Chain.insertMany(chains);
  await Cryptocurrency.insertMany(cryptocurrencies);

  console.log('Seed complete: chains and cryptocurrencies populated.');
  await mongoose.disconnect();
};

void main().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
