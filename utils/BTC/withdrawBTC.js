const bitcoin = require("bitcoinjs-lib");
const axios = require("axios");
const coinSelect = require("coinselect");
const { getMainExchangeWalletPrivateKey, getMainExchangeWallet } = require("./generateBtcAddress");
const { getBTCUtxos } = require("./getBTCUtxos");

const NETWORK = bitcoin.networks.bitcoin; // Mainnet
const FEE_RATE = 10; // Satoshis per byte (adjust based on network conditions)

async function withdrawBTC(selectedCrypto, recipient, amount) {
    try {
        const senderKeyPair = bitcoin.ECPair.fromWIF(getMainExchangeWalletPrivateKey("BITCOIN"), NETWORK);
        const senderAddress = getMainExchangeWallet("BITCOIN").address;

        console.log(`🔹 BTC Withdrawal | Sending ${amount} BTC from ${senderAddress} to ${recipient}`);

        // 🔹 Fetch UTXOs for the sender's BTC address
        const utxos = await getBTCUtxos(senderAddress);
        if (!utxos.length) throw new Error("No UTXOs available");

        // 🔹 Convert amount to satoshis
        const targetAmount = Math.floor(amount * 1e8);

        // 🔹 Select UTXOs for transaction
        const { inputs, outputs, fee } = coinSelect(utxos, [{ address: recipient, value: targetAmount }], FEE_RATE);
        if (!inputs || !outputs) throw new Error("Insufficient balance or fee issue");

        // 🔹 Build Bitcoin Transaction
        const psbt = new bitcoin.Psbt({ network: NETWORK });

        // Add Inputs
        inputs.forEach(input => {
            psbt.addInput({
                hash: input.txId,
                index: input.vout,
                witnessUtxo: {
                    script: Buffer.from(input.scriptPubKey, "hex"),
                    value: input.value,
                },
            });
        });

        // Add Outputs
        outputs.forEach(output => {
            psbt.addOutput({ address: output.address, value: output.value });
        });

        // 🔹 Sign Transaction
        inputs.forEach((_, index) => {
            psbt.signInput(index, senderKeyPair);
        });
        psbt.finalizeAllInputs();

        // 🔹 Get Raw Transaction Hex
        const rawTx = psbt.extractTransaction().toHex();
        console.log("✅ Signed Transaction: ", rawTx);

        // 🔹 Broadcast Transaction
        const broadcastResponse = await axios.post("https://blockstream.info/api/tx", rawTx, {
            headers: { "Content-Type": "text/plain" },
        });

        console.log(`✅ BTC Withdrawal Successful | Tx: https://blockstream.info/tx/${broadcastResponse.data}`);
        return broadcastResponse.data;
    } catch (error) {
        console.error("🚨 BTC Withdrawal Error:", error.message);
        throw new Error("BTC Withdrawal Failed");
    }
}

module.exports = { withdrawBTC };
