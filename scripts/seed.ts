import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chain from '../models/chainModel';
import Cryptocurrency from '../models/cryptocurrencyModel';

dotenv.config();

// Real mainnet contract addresses
const chains = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
    chain_id: 1,
    native_token: 'ETH',
    exchange_wallet_address: '0x28C6c06298d514Db089934071355E5743bf21d60',
    rpcUrl: process.env.ETH_RPC_URL ?? 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorerUrl: 'https://etherscan.io',
    tokens: [
      { symbol: 'USDT', name: 'Tether USD',  contract_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6  },
      { symbol: 'USDC', name: 'USD Coin',    contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6  },
      { symbol: 'LINK', name: 'Chainlink',   contract_address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
      { symbol: 'UNI',  name: 'Uniswap',     contract_address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
      { symbol: 'SHIB', name: 'Shiba Inu',   contract_address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', decimals: 18 },
      { symbol: 'MATIC',name: 'Polygon',     contract_address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', decimals: 18 },
    ],
    deposit_addresses: [],
  },
  {
    name: 'BNB Smart Chain',
    symbol: 'BSC',
    chain_id: 56,
    native_token: 'BNB',
    exchange_wallet_address: '0x5a52E96BAcdaBb82fd05763E25335261B270Efcb',
    rpcUrl: process.env.BSC_RPC_URL ?? 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', contract_address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
      { symbol: 'USDC', name: 'USD Coin',   contract_address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
    ],
    deposit_addresses: [],
  },
  {
    name: 'Polygon',
    symbol: 'MATIC',
    chain_id: 137,
    native_token: 'MATIC',
    exchange_wallet_address: '0x742d35Cc6634C0532925a3b8D4A6E4c9a3b7f890',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    tokens: [
      { symbol: 'USDC', name: 'USD Coin',   contract_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6  },
      { symbol: 'USDT', name: 'Tether USD', contract_address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6  },
    ],
    deposit_addresses: [],
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    chain_id: 0,
    native_token: 'SOL',
    exchange_wallet_address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    rpcUrl: process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    tokens: [
      { symbol: 'USDC', name: 'USD Coin',   contract_address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
      { symbol: 'USDT', name: 'Tether USD', contract_address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',  decimals: 6 },
    ],
    deposit_addresses: [],
  },
];

// Prices approximate as of May 2026
const ETH_ADDR  = '0x28C6c06298d514Db089934071355E5743bf21d60';
const BSC_ADDR  = '0x5a52E96BAcdaBb82fd05763E25335261B270Efcb';
const MATIC_ADDR = '0x742d35Cc6634C0532925a3b8D4A6E4c9a3b7f890';
const SOL_ADDR  = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH';

const cryptocurrencies = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    current_price: 95000,
    decimals: 8,
    chains: [],
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    current_price: 3200,
    decimals: 18,
    chains: [
      { chain_name: 'Ethereum', wallet_address: ETH_ADDR, contract_address: '', supply: 0 },
    ],
  },
  {
    name: 'BNB',
    symbol: 'BNB',
    current_price: 650,
    decimals: 18,
    chains: [
      { chain_name: 'BNB Smart Chain', wallet_address: BSC_ADDR, contract_address: '', supply: 0 },
    ],
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    current_price: 185,
    decimals: 9,
    chains: [
      { chain_name: 'Solana', wallet_address: SOL_ADDR, contract_address: '', supply: 0 },
    ],
  },
  {
    name: 'XRP',
    symbol: 'XRP',
    current_price: 2.30,
    decimals: 6,
    chains: [],
  },
  {
    name: 'Cardano',
    symbol: 'ADA',
    current_price: 0.75,
    decimals: 6,
    chains: [],
  },
  {
    name: 'Dogecoin',
    symbol: 'DOGE',
    current_price: 0.38,
    decimals: 8,
    chains: [],
  },
  {
    name: 'Tether USD',
    symbol: 'USDT',
    current_price: 1.00,
    decimals: 6,
    chains: [
      { chain_name: 'Ethereum',       wallet_address: ETH_ADDR,   contract_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', supply: 0 },
      { chain_name: 'BNB Smart Chain',wallet_address: BSC_ADDR,   contract_address: '0x55d398326f99059fF775485246999027B3197955', supply: 0 },
      { chain_name: 'Polygon',        wallet_address: MATIC_ADDR, contract_address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', supply: 0 },
      { chain_name: 'Solana',         wallet_address: SOL_ADDR,   contract_address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',  supply: 0 },
    ],
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    current_price: 1.00,
    decimals: 6,
    chains: [
      { chain_name: 'Ethereum',       wallet_address: ETH_ADDR,   contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', supply: 0 },
      { chain_name: 'BNB Smart Chain',wallet_address: BSC_ADDR,   contract_address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', supply: 0 },
      { chain_name: 'Polygon',        wallet_address: MATIC_ADDR, contract_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', supply: 0 },
      { chain_name: 'Solana',         wallet_address: SOL_ADDR,   contract_address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', supply: 0 },
    ],
  },
  {
    name: 'Polygon',
    symbol: 'MATIC',
    current_price: 0.55,
    decimals: 18,
    chains: [
      { chain_name: 'Polygon',  wallet_address: MATIC_ADDR, contract_address: '', supply: 0 },
      { chain_name: 'Ethereum', wallet_address: ETH_ADDR,   contract_address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', supply: 0 },
    ],
  },
  {
    name: 'Chainlink',
    symbol: 'LINK',
    current_price: 18.00,
    decimals: 18,
    chains: [
      { chain_name: 'Ethereum', wallet_address: ETH_ADDR, contract_address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', supply: 0 },
    ],
  },
  {
    name: 'Uniswap',
    symbol: 'UNI',
    current_price: 9.00,
    decimals: 18,
    chains: [
      { chain_name: 'Ethereum', wallet_address: ETH_ADDR, contract_address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', supply: 0 },
    ],
  },
  {
    name: 'Shiba Inu',
    symbol: 'SHIB',
    current_price: 0.000025,
    decimals: 18,
    chains: [
      { chain_name: 'Ethereum', wallet_address: ETH_ADDR, contract_address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', supply: 0 },
    ],
  },
];

const main = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) { console.error('MONGO_URI not set'); process.exit(1); }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  await Chain.deleteMany({});
  await Cryptocurrency.deleteMany({});
  console.log('Cleared existing chains and cryptocurrencies');

  await Chain.insertMany(chains);
  console.log(`Inserted ${chains.length} chains`);

  await Cryptocurrency.insertMany(cryptocurrencies);
  console.log(`Inserted ${cryptocurrencies.length} cryptocurrencies`);

  console.log('\nDone:');
  console.log('  Chains:', chains.map(c => c.name).join(', '));
  console.log('  Cryptos:', cryptocurrencies.map(c => c.symbol).join(', '));

  await mongoose.disconnect();
};

void main().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
