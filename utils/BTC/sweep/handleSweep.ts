import axios from 'axios';

interface BlockchainUtxoResponse {
  unspent_outputs?: Array<{
    tx_hash_big_endian: string;
    tx_output_n: number;
    value: number;
  }>;
}

export async function handleSweep(
  network: string,
  depositAddress: string,
  mainExchangeWallet: string
): Promise<void> {
  try {
    const apiUrl =
      network === 'mainnet'
        ? 'https://blockchain.info/unspent?active='
        : 'https://testnet.blockchain.info/unspent?active=';

    const utxoResponse = await axios.get<BlockchainUtxoResponse>(`${apiUrl}${depositAddress}`);
    const utxos = utxoResponse.data.unspent_outputs ?? [];

    if (utxos.length === 0) {
      console.log(`No BTC to sweep for ${depositAddress}`);
      return;
    }

    // NOTE: bitcoinjs-lib v6 removed TransactionBuilder. Signing requires a
    // separate Signer wired in by the caller; this stub records intent.
    let inputSum = 0;
    for (const utxo of utxos) {
      inputSum += utxo.value;
    }

    const fee = 10000;
    const amountToSend = inputSum - fee;
    if (amountToSend <= 0) {
      console.log('Not enough BTC after fees.');
      return;
    }

    console.log(`Would sweep ${amountToSend} sats to ${mainExchangeWallet}`);
  } catch (error) {
    console.error('BTC Sweep Error:', error);
  }
}
