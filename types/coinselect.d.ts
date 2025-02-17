declare module 'coinselect' {
  type Input = {
    txId: string;
    vout: number;
    value: number;
    scriptPubKey: string;
  };

  type Output = {
    address: string;
    value: number;
  };

  type Result = {
    inputs: Input[];
    outputs: Output[];
    fee: number;
  };

  function coinSelect(utxos: Input[], outputs: Output[], feeRate: number): Result;
  export = coinSelect;
}

declare module 'coinselect'; 