const axios = require("axios");
const { getAllDepositAddresses, getXpubForNetwork } = require("../utils/deposits/getBitcoinXpub");

async function createWebhook(network) {
    try {
        let apiUrl, requestBody, headers;

        switch (network) {
            case "Ethereum":
            case "BSC":
                apiUrl = "https://dashboard.alchemyapi.io/api/create-webhook";
                requestBody = {
                    webhook_type: "ADDRESS_ACTIVITY",
                    addresses: getAllDepositAddresses(network),
                    network: network,
                    url: `https://your-exchange.com/api/handleEvmDeposit`,
                };
                headers = { "x-api-key": process.env.ALCHEMY_API_KEY };
                break;

            case "Solana":
                apiUrl = "https://api.helius.xyz/v0/webhooks";
                requestBody = {
                    webhook_type: "account",
                    account_addresses: getAllDepositAddresses(network),
                    webhook_url: "https://your-exchange.com/api/handleSolanaDeposit",
                    transaction_types: ["ALL"],
                };
                headers = { "x-api-key": process.env.HELIUS_API_KEY };
                break;

            case "Bitcoin":
                const xPub = getXpubForNetwork(network); // Get xPub for Bitcoin deposits
                apiUrl = `https://api.blockcypher.com/v1/btc/main/hooks`;
                requestBody = {
                    event: "confirmed-tx",
                    address: xPub, // Track all derived addresses
                    url: "https://your-exchange.com/api/handleBitcoinDeposit",
                };
                headers = { "Content-Type": "application/json" };
                break;

            default:
                console.warn(`⚠️ Unsupported network: ${network}`);
                return;
        }

        const response = await axios.post(apiUrl, requestBody, { headers });
        console.log(`✅ Webhook created for ${network}:`, response.data);
    } catch (error) {
        console.error(`🚨 ${network} Webhook Error:`, error.response?.data || error.message);
    }
}

// Create webhooks for each supported network
["Ethereum", "BSC", "Solana", "Bitcoin"].forEach(createWebhook);
