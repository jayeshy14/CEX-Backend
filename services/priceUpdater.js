//priceUpdater.js
const axios = require('axios');
const cacheService = require('./cacheService');

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const ids = 'bitcoin,ethereum,solana';
const cacheKey = 'realTimePrices';

const updatePrices = async () => {
  try {
    const response = await axios.get(COINGECKO_API_URL, {
      params: { ids, vs_currencies: 'usd' },
    });
    const prices = response.data;

    // Update the cache
    cacheService.set(cacheKey, prices);
    console.log('Prices updated:', prices);
  } catch (error) {
    console.error('Error updating prices:', error);
  }
};

// Run every 10 seconds
setInterval(updatePrices, 10000);

module.exports = { updatePrices };
