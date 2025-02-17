const axios = require("axios");

async function getBTCUtxos(address) {
    try {
        const response = await axios.get(`https://blockstream.info/api/address/${address}/utxo`);
        return response.data.map(utxo => ({
            txId: utxo.txid,
            vout: utxo.vout,
            value: utxo.value, // Satoshis
            scriptPubKey: utxo.scriptpubkey,
        }));
    } catch (error) {
        console.error("🚨 Error fetching BTC UTXOs:", error.message);
        return [];
    }
}

module.exports = { getBTCUtxos };
