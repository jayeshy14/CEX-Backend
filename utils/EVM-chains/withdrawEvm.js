const { ethers } = require("ethers");
const {getMainExchangeWalletPrivateKey} = require("./generateEvmAddress");

async function withdrawEVM(selectedCrypto, recipient, amount, chain) {
    const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
    const wallet = new ethers.Wallet(getMainExchangeWalletPrivateKey(chain.name), provider);

    // Check if the token is native to the chain
    const isNative = selectedCrypto.symbol === chain.native_token;

    if (isNative) {
        // Native token transfer (ETH, BNB, MATIC)
        const tx = await wallet.sendTransaction({
            to: recipient,
            value: ethers.parseEther(amount.toString())
        });

        console.log(`✅ Native Transfer: Sent ${amount} ${selectedCrypto.symbol} to ${recipient} on ${chain.name}. Tx: ${tx.hash}`);
        await tx.wait();
    } else {
        // ERC-20 Token Transfer
        const token = chain.tokens.find(t => t.symbol === selectedCrypto.symbol);
        if (!token) throw new Error(`Token ${selectedCrypto.symbol} not found on ${chain.name}`);

        const tokenContract = new ethers.Contract(token.contract_address, chain.erc20Abi, wallet);
        const parsedAmount = ethers.parseUnits(amount.toString(), token.decimals);

        const tx = await tokenContract.transfer(recipient, parsedAmount);
        console.log(`✅ ERC-20 Transfer: Sent ${amount} ${selectedCrypto.symbol} to ${recipient} on ${chain.name}. Tx: ${tx.hash}`);
        await tx.wait();
    }
}

module.exports = { withdrawEVM };
