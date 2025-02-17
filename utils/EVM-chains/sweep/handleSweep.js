const ethers = require("ethers");
const {sweepNativeToken} = require("./sweepNativeToken");
const {sweepOtherTokens} = require("./sweepOtherTokens");

async function handleSweep(chain, depositWallet, contractAddress, mainExchangeWallet) {
    const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
    depositWallet = depositWallet.connect(provider);

    if (!contractAddress) {
        await sweepNativeToken(depositWallet, mainExchangeWallet);
    } else {
        await sweepOtherTokens(depositWallet, contractAddress);
    }
}

module.exports = { handleSweep };
