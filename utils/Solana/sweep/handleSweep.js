const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const { sweepNativeToken } = require("./sweepNativeToken");
const { sweepOtherTokens } = require("./sweepOtherTokens");

async function handleSweep(chain, depositWallet, contractAddress, mainExchangeWallet) {
    const connection = new Connection(chain.rpcUrl, "confirmed");

    if (!contractAddress) {
        await sweepNativeToken(connection, depositWallet, mainExchangeWallet);
    } else {
        await sweepOtherTokens(connection, depositWallet, contractAddress, mainExchangeWallet);
    }
}

module.exports = { handleSweep };
