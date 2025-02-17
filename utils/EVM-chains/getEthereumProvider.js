const ethers = require("ethers");

const rpcUrl = "";

const ethereumProvider = new ethers.JsonRpcProvider(rpcUrl);

module.exports = {ethereumProvider};