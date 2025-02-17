const MNEMONICS = {
    "ETHEREUM": "object identify budget trim law giraffe total club ocean orbit behind uncover",
    "SOLANA": "object identify budget trim law giraffe total club ocean orbit behind uncover",
    "BITCOIN": "object identify budget trim law giraffe total club ocean orbit behind uncover",
}

const getMnemonic = (chainName) => {
    const mnemonicKey = `${chainName}`;
    return MNEMONICS[mnemonicKey] || null;
};

module.exports = { getMnemonic };