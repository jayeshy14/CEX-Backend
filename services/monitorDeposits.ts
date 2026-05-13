import axios from 'axios';
import { getAllDepositAddresses, getXpubForNetwork } from '../utils/deposits/getBitcoinXpub';

async function createWebhook(network: string): Promise<void> {
  try {
    let apiUrl: string;
    let requestBody: Record<string, unknown>;
    let headers: Record<string, string>;

    switch (network) {
      case 'Ethereum':
      case 'BSC':
        apiUrl = 'https://dashboard.alchemyapi.io/api/create-webhook';
        requestBody = {
          webhook_type: 'ADDRESS_ACTIVITY',
          addresses: await getAllDepositAddresses(),
          network,
          url: 'https://your-exchange.com/api/handleEvmDeposit',
        };
        headers = { 'x-api-key': process.env.ALCHEMY_API_KEY ?? '' };
        break;

      case 'Solana':
        apiUrl = 'https://api.helius.xyz/v0/webhooks';
        requestBody = {
          webhook_type: 'account',
          account_addresses: await getAllDepositAddresses(),
          webhook_url: 'https://your-exchange.com/api/handleSolanaDeposit',
          transaction_types: ['ALL'],
        };
        headers = { 'x-api-key': process.env.HELIUS_API_KEY ?? '' };
        break;

      case 'Bitcoin': {
        const xPub = getXpubForNetwork(network);
        apiUrl = 'https://api.blockcypher.com/v1/btc/main/hooks';
        requestBody = {
          event: 'confirmed-tx',
          address: xPub,
          url: 'https://your-exchange.com/api/handleBitcoinDeposit',
        };
        headers = { 'Content-Type': 'application/json' };
        break;
      }

      default:
        console.warn(`Unsupported network: ${network}`);
        return;
    }

    const response = await axios.post(apiUrl, requestBody, { headers });
    console.log(`Webhook created for ${network}:`, response.data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`${network} Webhook Error:`, msg);
  }
}

const networks = ['Ethereum', 'BSC', 'Solana', 'Bitcoin'];
for (const network of networks) {
  void createWebhook(network);
}
