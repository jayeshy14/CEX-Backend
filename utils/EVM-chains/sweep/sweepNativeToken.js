const ethers = require("ethers");
const { ethereumProvider } = require("../getEthereumProvider");


const sweepNativeToken = async(depositWallet, mainExchangeWallet) => {
    try {
        const balance = await ethereumProvider.getBalance(depositWallet.address);
        if (balance.lte(ethers.parseEther("0.0001"))) {
            console.log(`Skipping ${depositWallet.address}, balance too low.`);
            return;
        }

        // Deduct gas fees
        const gasLimit = 21000;
        const gasPrice = await provider.getFeeData().then(fee => fee.gasPrice);
        const txValue = balance.sub(gasPrice.mul(gasLimit));

        const tx = await depositWallet.sendTransaction({
            to: mainExchangeWallet,
            value: txValue,
            gasLimit,
        });

        console.log(`Swept ${ethers.formatEther(txValue)} native tokens to main wallet: ${tx.hash}`);
    } catch (error) {
        console.error("Native Token Sweep Error:", error);
    }

}

module.exports = {sweepNativeToken}