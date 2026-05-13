declare module 'bs58' {
  const bs58: {
    encode(buffer: Buffer | Uint8Array): string;
    decode(value: string): Buffer;
  };
  export default bs58;
}
