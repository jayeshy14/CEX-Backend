const bip39 = require('bip39');
const bs58 = require('bs58');
const nacl = require('tweetnacl');
const { derivePath } = require('ed25519-hd-key');
const { getMnemonic } = require('../deposits/getMnemonic');

// Function to derive a Solana private key from mnemonic for a user deposit address
const getSolanaPrivateKey = (userId, chainName) => { 
    const mnemonic = getMnemonic(chainName);
    if (!mnemonic) throw new Error("Mnemonic not found for chain");

    // Convert mnemonic to seed
    const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex'); 

    // Generate deterministic user index
    const hashedUserId = parseInt(Buffer.from(userId.toString()).toString("hex").slice(0, 8), 16);
    const userIndex = hashedUserId % 100000;

    // Solana Derivation Path for user deposit wallet
    const derivationPath = `m/44'/501'/${userIndex}'/0'`;
    console.log("Using derivation path:", derivationPath);

    // Derive the key
    const { key } = derivePath(derivationPath, seed);
    if (!key) throw new Error("derivePath failed, check seed or derivation path");

    return key;
};

// Function to derive the main exchange wallet (fixed path)
const getMainSolanaPrivateKey = (chainName) => {
    const mnemonic = getMnemonic(chainName);
    if (!mnemonic) throw new Error("Mnemonic not found for chain");

    // Convert mnemonic to seed
    const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex'); 

    // Fixed derivation path for main exchange wallet
    const derivationPath = `m/44'/501'/0'/0'`;
    console.log("Deriving Main Exchange Wallet at:", derivationPath);

    // Derive the key
    const { key } = derivePath(derivationPath, seed);
    if (!key) throw new Error("derivePath failed for main wallet");

    return key;
};

// Function to get a user's Solana deposit address
const getSolanaAddress = (userId, chainName) => {
    const privateKey = getSolanaPrivateKey(userId, chainName);
    const keypair = nacl.sign.keyPair.fromSeed(privateKey);
    const publicKey = bs58.encode(keypair.publicKey);

    console.log("User's Solana Deposit Address:", publicKey);
    return publicKey;
};

// Function to get the main exchange wallet address
const getMainExchangeWallet = (chainName) => {
    const privateKey = getMainSolanaPrivateKey(chainName);
    const keypair = nacl.sign.keyPair.fromSeed(privateKey);
    const publicKey = bs58.encode(keypair.publicKey);

    console.log("🚀 Main Exchange Solana Wallet Address:", publicKey);
    return publicKey;
};

module.exports = { getSolanaAddress, getSolanaPrivateKey, getMainExchangeWallet };
