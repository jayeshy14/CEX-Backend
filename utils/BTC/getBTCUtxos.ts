import axios from 'axios';

export interface BTCUtxo {
  txId: string;
  vout: number;
  value: number;
  scriptPubKey: string;
}

interface BlockstreamUtxo {
  txid: string;
  vout: number;
  value: number;
  scriptpubkey: string;
}

export async function getBTCUtxos(address: string): Promise<BTCUtxo[]> {
  try {
    const response = await axios.get<BlockstreamUtxo[]>(
      `https://blockstream.info/api/address/${address}/utxo`
    );
    return response.data.map((utxo) => ({
      txId: utxo.txid,
      vout: utxo.vout,
      value: utxo.value,
      scriptPubKey: utxo.scriptpubkey,
    }));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching BTC UTXOs:', msg);
    return [];
  }
}
