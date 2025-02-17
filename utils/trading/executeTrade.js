const Trade = require("../../models/tradeModel");
const Wallet = require("../../models/walletModel");
const Cryptocurrency = require("../../models/cryptocurrencyModel");


const executeTrade = async (buyOrder, sellOrder, tradeAmount, tradePrice, cryptocurrencyIdA, cryptocurrencyIdB) => {


    const buyerWallet = await Wallet.findOne({user_id: buyOrder.user_id});
    const sellerWallet = await Wallet.findOne({user_id: sellOrder.user_id});

    if(!buyerWallet || !sellerWallet) {
        throw new Error("Wallet not found for buyer or seller!");
    }

    const buyerWalletCryptocurrencyA = await WalletCryptocurrency.findOne({
        cryptocurrency_id: cryptocurrencyIdA,
        wallet_id: buyerWallet._id
    })

    const buyerWalletCryptocurrencyB = await WalletCryptocurrency.findOne({
        cryptocurrency_id: cryptocurrencyIdB,
        wallet_id: buyerWallet._id
    })

    const sellerWalletCryptocurrencyA = await WalletCryptocurrency.findOne({
        cryptocurrency_id: cryptocurrencyIdA,
        wallet_id: sellerWallet._id
    })

    const sellerWalletCryptocurrencyB = await WalletCryptocurrency.findOne({
        cryptocurrency_id: cryptocurrencyIdB,
        wallet_id: sellerWallet._id
    })

    //If buyer do not have a cryptocurrency wallet for cryptocurrency A, create one
    if(!buyerWalletCryptocurrencyA) {
        try{
            buyerWalletCryptocurrencyA = await WalletCryptocurrency.create({
                cryptocurrency_amount: 0,
                wallet_id: buyOrder.user_id,
                cryptocurrency_id: cryptocurrencyIdA
            })
        }catch{
            throw new Error("Could not create cryptocurrency wallet for user! Try again!");
        }

    }

    //If buyer do not have a cryptocurrency wallet for cryptocurrency B, create one
    if(!sellerWalletCryptocurrencyB) {
        try{
            sellerWalletCryptocurrencyB = await WalletCryptocurrency.create({
                cryptocurrency_amount: 0,
                wallet_id: buyOrder.user_id,
                cryptocurrency_id: cryptocurrencyIdB
            })
        }catch{
            throw new Error("Could not create cryptocurrency wallet for user! Try again!");
        }

    }

    if (!buyerWalletCryptocurrencyB || buyerWalletCryptocurrencyB.cryptocurrency_amount < tradeAmount * tradePrice) {
        throw new Error("Buyer does not have enough cryptocurrency to buy!");
    }

    if (!sellerWalletCryptocurrencyA || sellerWalletCryptocurrencyA.cryptocurrency_amount < tradeAmount) {
        throw new Error("Seller does not have enough cryptocurrency to sell!");
    }

    buyerWalletCryptocurrencyB.cryptocurrency_amount -= tradeAmount * tradePrice;
    await buyerWalletCryptocurrencyB.save();

    buyerWalletCryptocurrencyA.cryptocurrency_amount += tradeAmount;
    await buyerWalletCryptocurrencyA.save();

    sellerWalletCryptocurrencyA.cryptocurrency_amount -= tradeAmount;
    await sellerWalletCryptocurrencyA.save();

    if (!sellerWalletCryptocurrencyB) {
        try {
            sellerWalletCryptocurrencyB = await WalletCryptocurrency.create({
                cryptocurrency_amount: 0,
                wallet_id: sellerWallet._id,
                cryptocurrency_id: cryptocurrencyIdB,
            });
        } catch {
            throw new Error("Could not create cryptocurrency wallet for seller! Try again!");
        }
    }

    sellerWalletCryptocurrencyB.cryptocurrency_amount += tradeAmount * tradePrice;
    await sellerWalletCryptocurrencyB.save();

    buyOrder.amount -= tradeAmount;
    if (buyOrder.amount === 0) {
        buyOrder.status = "filled";
    }
    await buyOrder.save();

    sellOrder.amount -= tradeAmount;
    if (sellOrder.amount === 0) {
        sellOrder.status = "filled";
    }
    await sellOrder.save();

    const trade = await Trade.create({
        cryptocurrency_id_A: cryptocurrencyIdA,
        cryptocurrency_id_B: cryptocurrencyIdB,
        order_id: buyOrder._id,
        buyer_id: buyOrder.user_id,
        seller_id: sellOrder.user_id,
        amount: tradeAmount,
        price: tradePrice,
        created_at: Date.now(),
    });

    buyOrder.trades.push(trade._id);
    sellOrder.trades.push(trade._id);
    await buyOrder.save();
    await sellOrder.save();

    const cryptocurrency = await Cryptocurrency.findById(cryptocurrencyIdA);
    if (cryptocurrency) {
        cryptocurrency.current_price = tradePrice;
        await cryptocurrency.save();
    }

}

module.exports = {executeTrade};