import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const ids = 'bitcoin,ethereum,solana';

interface PriceResponse {
  [key: string]: { usd: number };
}

const priceCache = new Map<string, PriceResponse>();

export const updatePrices = async (): Promise<void> => {
  try {
    const response = await axios.get<PriceResponse>(COINGECKO_API_URL, {
      params: { ids, vs_currencies: 'usd' },
    });
    const prices = response.data;
    priceCache.set('realTimePrices', prices);
    console.log('Prices updated:', prices);
  } catch (error) {
    console.error('Error updating prices:', error);
  }
};

export const getCachedPrices = (): PriceResponse | undefined => priceCache.get('realTimePrices');

// Run every 10 seconds
setInterval(() => {
  void updatePrices();
}, 10000);
