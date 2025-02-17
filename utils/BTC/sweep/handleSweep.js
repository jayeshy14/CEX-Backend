const bitcoin = require("bitcoinjs-lib");
const axios = require("axios");

async function handleSweep(network, depositAddress, mainExchangeWallet) {
    try {
        const apiUrl = network === "mainnet"
            ? "https://blockchain.info/unspent?active="
            : "https://testnet.blockchain.info/unspent?active=";

        // Fetch UTXOs from a block explorer
        const utxoResponse = await axios.get(`${apiUrl}${depositAddress}`);
        const utxos = utxoResponse.data.unspent_outputs;

        if (!utxos || utxos.length === 0) {
            console.log(`No BTC to sweep for ${depositAddress}`);
            return;
        }

        const networkType = network === "mainnet" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
        const txb = new bitcoin.TransactionBuilder(networkType);
        
        let inputSum = 0;
        utxos.forEach((utxo) => {
            txb.addInput(utxo.tx_hash_big_endian, utxo.tx_output_n);
            inputSum += utxo.value;
        });

        // Define fees and output amount
        const fee = 10000; // 0.0001 BTC (Adjust based on network congestion)
        const amountToSend = inputSum - fee;
        if (amountToSend <= 0) {
            console.log("Not enough BTC after fees.");
            return;
        }

        txb.addOutput(mainExchangeWallet, amountToSend);

        // Sign all inputs
        for (let i = 0; i < utxos.length; i++) {
            txb.sign(i, depositWalletPrivateKey); // Ensure you have the private key
        }

        // Broadcast the transaction
        const txHex = txb.build().toHex();
        await axios.post("https://blockstream.info/api/tx", txHex); // Replace with a suitable API

        console.log(`✅ BTC swept to main wallet: ${mainExchangeWallet}`);
    } catch (error) {
        console.error("🚨 BTC Sweep Error:", error);
    }
}

module.exports = { handleSweep };
