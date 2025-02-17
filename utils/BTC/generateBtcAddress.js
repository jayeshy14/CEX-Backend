const { mnemonicToSeedSync } = require("bip39");
const bs58 = require("bs58");
const { getMnemonic } = require("../deposits/getMnemonic");
const HARDENED_OFFSET = 0x80000000;

// HMAC-SHA512 using Web Crypto API
const hmacSha512 = async (key, data) => {
    const keyBuffer = new TextEncoder().encode(key);
    const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
    const dataBuffer = new Uint8Array(data);
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);
    return new Uint8Array(signature);
};

// Generate master key from seed
const getMasterKeyFromSeed = async (seed) => {
    const key = "Bitcoin seed";
    const I = await hmacSha512(key, seed);
    return {
        key: I.slice(0, 32),
        chainCode: I.slice(32),
    };
};

// Derive a child key from the master key using BIP32-like derivation
const derivePath = async (path, seed) => {
    let { key, chainCode } = await getMasterKeyFromSeed(seed);

    const segments = path
        .split("/")
        .slice(1)
        .map((val) => (val.endsWith("'") ? parseInt(val.slice(0, -1), 10) + HARDENED_OFFSET : parseInt(val, 10)));

    for (let index of segments) {
        const indexBuffer = new Uint8Array(4);
        new DataView(indexBuffer.buffer).setUint32(0, index, false);
        const data = new Uint8Array([0, ...key, ...indexBuffer]);
        const I = await hmacSha512(chainCode, data);

        key = I.slice(0, 32);
        chainCode = I.slice(32);
    }

    return { key, chainCode };
};

// Generate Bitcoin address from derived key
const getBitcoinAddress = (publicKey, addressType) => {
    if (addressType === "legacy") {
        // Legacy (P2PKH) Address
        return bs58.encode(publicKey);
    } else if (addressType === "segwit") {
        // SegWit (P2SH) Address
        return "3" + bs58.encode(publicKey);
    } else {
        // Native SegWit (Bech32)
        return "bc1" + bs58.encode(publicKey);
    }
};

const getPrivateKey = async (userId, chainName) => {
    const mnemonic = getMnemonic(chainName);
    if (!mnemonic) throw new Error("Mnemonic not found for given chain");

    const seed = mnemonicToSeedSync(mnemonic);

    // Generate user index
    const hashedUserId = parseInt(Buffer.from(userId.toString()).toString("hex").slice(0, 8), 16);
    const userIndex = hashedUserId % 100000;

    // BIP-44-like derivation path for Bitcoin
    const derivationPath = `m/44'/0'/${userIndex}'/0/0`;

    console.log("Using derivation path:", derivationPath);

    // Derive the key
    const derived = await derivePath(derivationPath, seed);
    if (!derived || !derived.key) {
        throw new Error("derivePath failed, check seed or derivation path");
    }

    return derived.key;
};

const getBTCAddress = async (userId, chainName, addressType = "native-segwit") => {
    const privateKey = await getPrivateKey(userId, chainName);
    const bitcoinAddress = getBitcoinAddress(privateKey, addressType);
    
    console.log(`Bitcoin Address (${addressType}):`, bitcoinAddress);
    return bitcoinAddress.toString();
};
const getMainExchangeWalletPrivateKey = (chainName) => {
    const mnemonic = getMnemonic(chainName);
    if (!mnemonic) throw new Error("Mnemonic not found for given chain");

    const seed = mnemonicToSeedSync(mnemonic);
    
    // Use a fixed derivation path for the main exchange wallet
    const derivationPath = `m/44'/0'/0'/0/0`;

    const derived = derivePath(derivationPath, seed);
    if (!derived || !derived.key) {
        throw new Error("Key derivation failed");
    }

    return derived.key;
};

// Function to get the main exchange wallet's Bitcoin address
const getMainExchangeWallet = (chainName, addressType = "native-segwit") => {
    const privateKey = getMainPrivateKey(chainName);
    const bitcoinAddress = getBitcoinAddress(privateKey, addressType);
    
    console.log(`Main Exchange Bitcoin Address (${addressType}):`, bitcoinAddress);
    return bitcoinAddress;
};



module.exports = {getBTCAddress, getPrivateKey, getMainExchangeWallet, getMainExchangeWalletPrivateKey};
