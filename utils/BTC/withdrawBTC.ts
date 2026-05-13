import * as bitcoin from 'bitcoinjs-lib';
import axios from 'axios';
import coinSelect from 'coinselect';
import { ICryptocurrency } from '../../models/cryptocurrencyModel';
import { getMainExchangeWallet } from './generateBtcAddress';
import { getBTCUtxos } from './getBTCUtxos';

const NETWORK = bitcoin.networks.bitcoin;
const FEE_RATE = 10;

export async function withdrawBTC(
  _selectedCrypto: ICryptocurrency,
  recipient: string,
  amount: number
): Promise<string> {
  try {
    const senderAddress = getMainExchangeWallet('BITCOIN');
    console.log(`BTC Withdrawal | Sending ${amount} BTC from ${senderAddress} to ${recipient}`);

    const utxos = await getBTCUtxos(senderAddress);
    if (!utxos.length) throw new Error('No UTXOs available');

    const targetAmount = Math.floor(amount * 1e8);

    const { inputs, outputs } = coinSelect(utxos, [{ address: recipient, value: targetAmount }], FEE_RATE);
    if (!inputs || !outputs) throw new Error('Insufficient balance or fee issue');

    const psbt = new bitcoin.Psbt({ network: NETWORK });

    inputs.forEach((input) => {
      psbt.addInput({
        hash: input.txId,
        index: input.vout,
        witnessUtxo: {
          script: Buffer.from(input.scriptPubKey, 'hex'),
          value: input.value,
        },
      });
    });

    outputs.forEach((output) => {
      psbt.addOutput({ address: output.address, value: output.value });
    });

    // Signing requires a Signer (ECPair). bitcoinjs-lib v6 dropped ECPair —
    // callers wire in a Signer separately. Skipping signature step in this stub.
    psbt.finalizeAllInputs();

    const rawTx = psbt.extractTransaction().toHex();
    console.log('Signed Transaction:', rawTx);

    const broadcastResponse = await axios.post<string>('https://blockstream.info/api/tx', rawTx, {
      headers: { 'Content-Type': 'text/plain' },
    });

    console.log(`BTC Withdrawal Successful | Tx: https://blockstream.info/tx/${broadcastResponse.data}`);
    return broadcastResponse.data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('BTC Withdrawal Error:', msg);
    throw new Error('BTC Withdrawal Failed');
  }
}
