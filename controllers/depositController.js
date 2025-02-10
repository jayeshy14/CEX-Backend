const Wallet = require("../models/walletModel")
import { Connection,  } from "@solana/web3.js";

exports.depositCrypto = async (req, res) => {
    try {
      const { userAddress, crypto, amount, txHash, chain } = req.body;
  
      if (!userAddress || !crypto || !amount || !txHash || !chain) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      let isValidTransaction = false;
  
      if (chain === "ETHEREUM" || chain === "BSC") {
        isValidTransaction = await handleEVMDeposit(userAddress, crypto, amount, txHash, chain);
      } else if (chain === "SOLANA") {
        isValidTransaction = await handleSolanaDeposit(userAddress, crypto, amount, txHash);
      }
  
      if (!isValidTransaction) {
        return res.status(400).json({ message: "Invalid or unconfirmed transaction" });
      }
  
      // Update user's wallet balance
      const wallet = await Wallet.findOne({ user_id: req.user.id });
      if (!wallet) return res.status(404).json({ message: "Wallet not found" });
  
      const tokenIndex = wallet.cryptos.findIndex((t) => t.symbol === crypto);
      if (tokenIndex >= 0) {
        wallet.cryptos[tokenIndex].balance += parseFloat(amount);
      } else {
        wallet.cryptos.push({ symbol: crypto, balance: parseFloat(amount) });
      }
  
      await wallet.save();
      res.status(200).json({ message: "Deposit verified and recorded", wallet });
    } catch (error) {
      console.error("Deposit verification failed:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  };

  const handleSolanaDeposit = async (userAddress, crypto, amount, txHash) => {
    const solanaConnection = new Connection(SOLANA_RPC_URL, "confirmed");
    const transaction = await solanaConnection.getTransaction(txHash, {
      commitment: "confirmed",
      encoding: "jsonParsed",
    });
  
    if (!transaction) {
      throw new Error("Invalid Solana transaction hash");
    }
  
    const sender = transaction.transaction.message.accountKeys[0].pubkey;
    const instructions = transaction.transaction.message.instructions;
  
    if (sender !== userAddress) {
      throw new Error("Transaction not sent from user wallet");
    }
  
    const cryptoData = await Cryptocurrency.findOne({ name: crypto });
    if (!cryptoData) {
      throw new Error("Invalid cryptocurrency selected");
    }
  
    const selectedChainData = cryptoData.chains.find((c) => c.chain_name === "SOLANA");
    if (!selectedChainData) {
      throw new Error("Invalid chain for cryptocurrency");
    }
  
    const exchangeWallet = selectedChainData.wallet_address;
  
    let depositAmount = 0;
    let foundMatchingTransfer = false;
  
    for (const instruction of instructions) {
      if (
        instruction.programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" &&
        instruction.parsed.type === "transfer"
      ) {
        const from = instruction.parsed.info.source;
        const to = instruction.parsed.info.destination;
        const transferredAmount = parseFloat(instruction.parsed.info.amount);
  
        if (from === userAddress && to === exchangeWallet) {
          depositAmount = transferredAmount;
          foundMatchingTransfer = true;
          break;
        }
      }
    }
  
    if (!foundMatchingTransfer) {
      throw new Error("No matching SPL token transfer found");
    }
  
    const expectedAmount = parseFloat(amount);
    if (depositAmount !== expectedAmount) {
      throw new Error("Deposit amount mismatch");
    }
  
    return true;
  };

  const handleEVMDeposit = async (userAddress, crypto, amount, txHash, chain) => {
    const provider = new ethers.JsonRpcProvider(
      chain === "ETHEREUM" ? ETH_RPC_URL : BSC_RPC_URL
    );
  
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      throw new Error("Invalid transaction hash");
    }
  
    if (tx.from.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error("Transaction not sent from user wallet");
    }
  
    const cryptoData = await Cryptocurrency.findOne({ name: crypto });
    if (!cryptoData) {
      throw new Error("Invalid cryptocurrency selected");
    }
  
    const selectedChainData = cryptoData.chains.find((c) => c.chain_name === chain);
    if (!selectedChainData) {
      throw new Error("Invalid chain for cryptocurrency");
    }
  
    const exchangeWallet = selectedChainData.wallet_address.toLowerCase();
    if (tx.to.toLowerCase() !== exchangeWallet) {
      throw new Error("Funds not sent to exchange wallet");
    }
  
    let expectedAmount;
    if (cryptoData.token_address) {
      const tokenContract = new ethers.Contract(cryptoData.token_address, ERC20_ABI, provider);
      const tokenDecimals = await tokenContract.decimals();
      expectedAmount = ethers.parseUnits(amount, tokenDecimals);
    } else {
      expectedAmount = ethers.parseUnits(amount, "ether");
    }
  
    if (!tx.value.eq(expectedAmount)) {
      throw new Error("Deposit amount mismatch");
    }
  
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.confirmations < 1) {
      throw new Error("Transaction not yet confirmed");
    }
  
    return true;
  };