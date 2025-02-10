const ethers = require("ethers");

const sendTokens = async(toAddress, amount, tokenAddress) => {

    try{
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
        //Token ABI 
        const tokenABI = [
            "function transfer(address to, uint256 amount) public returns (bool)"
        ];
        
        const contractInstance = new ethers.Contract(tokenAddress, tokenABI, wallet);
    
        const tokenAmount = ethers.parseEther(amount.toString());
    
        const tx = await contractInstance.transfer(toAddress, tokenAmount);
        console.log("Transaction Hash:", tx.hash);
    
        const receipt = await tx.wait();
        console.log("Transaction Receipt:", receipt);
    
        return receipt;
    }catch(error) {
        console.error("Error sending tokens:", error);
        throw new Error("Failed to process withdrawal");
    }


}