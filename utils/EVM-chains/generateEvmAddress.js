const { HDNodeWallet, keccak256, Mnemonic, Wallet } = require("ethers");
const { getMnemonic } = require("../deposits/getMnemonic");

const EXCHANGE_WALLETS = {
    "ETHEREUM": process.env.EXCHANGE_ETHEREUM_MNEMONIC,  // Store in .env
    "BSC": process.env.EXCHANGE_BSC_MNEMONIC,
};

/**
 * Generate a unique deposit address for a user
 * @param {string | number} userId - Unique user identifier
 * @param {string} chainName - Chain name (e.g., ETHEREUM, BSC)
 * @returns {string} Wallet Address
 */
const getEVMPrivateKey = (userId, chainName) => {
    const mnemonic = getMnemonic(chainName);
    if (!mnemonic) {
        throw new Error(`Mnemonic not found for ${chainName}`);
    }

    // Generate a unique user index (reduce large values to avoid issues)
    const hashedUserId = keccak256(Buffer.from(userId.toString())).slice(2, 10);
    const userIndex = parseInt(hashedUserId, 16) % 10000; // Max 4 digits

    // Derivation path for Ethereum (BIP-44 standard)
    const derivationPath = `m/44'/60'/0'/0/${userIndex}`;

    // Derive the wallet
    const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic), derivationPath);

    return wallet.privateKey;
};

const getMainExchangeWalletPrivateKey = (chainName) => {
    const mnemonic = EXCHANGE_WALLETS[chainName];
    if (!mnemonic) {
        throw new Error(`Exchange Mnemonic not found for ${chainName}`);
    }
    return getEVMPrivateKey(0, chainName);
}

/**
 * Generate a unique wallet address for a user
 */
const getEVMAddress = (userId, chainName) => {
    const privateKey = getEVMPrivateKey(userId, chainName);
    return new Wallet(privateKey).address;
};

/**
 * Get the fixed main exchange wallet (DO NOT DERIVE)
 */
const getMainExchangeWallet = (chainName) => {
    const mnemonic = EXCHANGE_WALLETS[chainName];
    if (!mnemonic) {
        throw new Error(`Exchange Mnemonic not found for ${chainName}`);
    }

    // Use a fixed derivation path for the exchange wallet
    const derivationPath = `m/44'/60'/0'/0/0`;
    const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic), derivationPath);

    return wallet.address;
};

module.exports = { getEVMAddress, getEVMPrivateKey, getMainExchangeWallet, getMainExchangeWalletPrivateKey };
