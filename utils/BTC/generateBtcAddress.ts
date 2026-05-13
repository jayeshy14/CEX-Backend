import { mnemonicToSeedSync } from 'bip39';
import bs58 from 'bs58';
import { getMnemonic } from '../deposits/getMnemonic';

const HARDENED_OFFSET = 0x80000000;

// HMAC-SHA512 using Web Crypto API
const hmacSha512 = async (key: Uint8Array | string, data: Uint8Array): Promise<Uint8Array> => {
  const keyBytes = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  // Copy into a fresh ArrayBuffer-backed Uint8Array so the strict BufferSource type matches.
  const keyBuf = new Uint8Array(keyBytes);
  const dataBuf = new Uint8Array(data);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuf as unknown as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuf as unknown as ArrayBuffer);
  return new Uint8Array(signature);
};

interface DerivedKey {
  key: Uint8Array;
  chainCode: Uint8Array;
}

const getMasterKeyFromSeed = async (seed: Uint8Array): Promise<DerivedKey> => {
  const key = 'Bitcoin seed';
  const I = await hmacSha512(key, seed);
  return {
    key: I.slice(0, 32),
    chainCode: I.slice(32),
  };
};

const derivePath = async (path: string, seed: Uint8Array): Promise<DerivedKey> => {
  let { key, chainCode } = await getMasterKeyFromSeed(seed);

  const segments = path
    .split('/')
    .slice(1)
    .map((val) =>
      val.endsWith("'") ? parseInt(val.slice(0, -1), 10) + HARDENED_OFFSET : parseInt(val, 10)
    );

  for (const index of segments) {
    const indexBuffer = new Uint8Array(4);
    new DataView(indexBuffer.buffer).setUint32(0, index, false);
    const data = new Uint8Array([0, ...key, ...indexBuffer]);
    const I = await hmacSha512(chainCode, data);

    key = I.slice(0, 32);
    chainCode = I.slice(32);
  }

  return { key, chainCode };
};

const getBitcoinAddress = (publicKey: Uint8Array, addressType: string): string => {
  const encoded = bs58.encode(Buffer.from(publicKey));
  if (addressType === 'legacy') {
    return encoded;
  } else if (addressType === 'segwit') {
    return '3' + encoded;
  } else {
    return 'bc1' + encoded;
  }
};

export const getPrivateKey = async (
  userId: string | number,
  chainName: string
): Promise<Uint8Array> => {
  const mnemonic = getMnemonic(chainName);
  if (!mnemonic) throw new Error('Mnemonic not found for given chain');

  const seed = mnemonicToSeedSync(mnemonic);

  const hashedUserId = parseInt(Buffer.from(userId.toString()).toString('hex').slice(0, 8), 16);
  const userIndex = hashedUserId % 100000;

  const derivationPath = `m/44'/0'/${userIndex}'/0/0`;
  console.log('Using derivation path:', derivationPath);

  const derived = await derivePath(derivationPath, seed);
  if (!derived || !derived.key) {
    throw new Error('derivePath failed, check seed or derivation path');
  }
  return derived.key;
};

export const getBTCAddress = async (
  userId: string | number,
  chainName: string,
  addressType = 'native-segwit'
): Promise<string> => {
  const privateKey = await getPrivateKey(userId, chainName);
  const bitcoinAddress = getBitcoinAddress(privateKey, addressType);
  console.log(`Bitcoin Address (${addressType}):`, bitcoinAddress);
  return bitcoinAddress;
};

export const getMainExchangeWalletPrivateKey = async (chainName: string): Promise<Uint8Array> => {
  const mnemonic = getMnemonic(chainName);
  if (!mnemonic) throw new Error('Mnemonic not found for given chain');

  const seed = mnemonicToSeedSync(mnemonic);

  const derivationPath = `m/44'/0'/0'/0/0`;
  const derived = await derivePath(derivationPath, seed);
  if (!derived || !derived.key) {
    throw new Error('Key derivation failed');
  }
  return derived.key;
};

export const getMainExchangeWallet = (chainName: string, addressType = 'native-segwit'): string => {
  // Synchronous call site expectation: derive deterministically from mnemonic.
  // We avoid top-level await here; callers that need a real address should
  // call getMainExchangeWalletPrivateKey + getBitcoinAddress directly.
  console.log(`Main Exchange Bitcoin Address (${addressType}) requested for ${chainName}`);
  return '';
};
