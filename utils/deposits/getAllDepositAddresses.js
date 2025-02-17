const Chain = require("../../models/chainModel");

const getAllDepositAddresses = async(chain) => {


    const chain = await Chain.findOne({ name: chain });

    if (!chain) {
        throw new Error("Chain not found");

    }

    return chain.deposit_addresses;
}

module.exports = { getAllDepositAddresses };
