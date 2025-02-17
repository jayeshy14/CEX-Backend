const ethers = require("ethers");

async function sweepOtherTokens(depositWallet, contractAddress) {
    try {
        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)"
        ];
        const tokenContract = new ethers.Contract(contractAddress, erc20Abi, depositWallet);

        const balance = await tokenContract.balanceOf(depositWallet.address);
        if (balance.lte(0)) {
            console.log(`No ${contractAddress} tokens in ${depositWallet.address}`);
            return;
        }

        const tx = await tokenContract.transfer(mainExchangeWallet, balance);
        console.log(`Swept ${balance} ERC-20 tokens to main wallet: ${tx.hash}`);
    } catch (error) {
        console.error("ERC-20 Sweep Error:", error);
    }
}

module.exports = {sweepOtherTokens}