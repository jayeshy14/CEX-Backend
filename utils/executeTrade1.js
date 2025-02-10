const Trade = require("../models/tradeModel");
const WalletCryptocurrency = require("../models/walletCryptocurrencyModel");
const Wallet = require("../models/walletModel");
const Cryptocurrency = require("../models/cryptocurrencyModel");


const executeTrade = async (buyOrder, sellOrder, tradeAmount, tradePrice, cryptocurrencyId) => {


    const buyerWallet = await Wallet.findOne({user_id: buyOrder.user_id});
    const sellerWallet = await Wallet.findOne({user_id: sellOrder.user_id});

    if(!buyerWallet || !sellerWallet) {
        throw new Error("Wallet not found for buyer or seller!");
    }

    //Update the buyer and seller wallets balances 
    //The additional fees the buyer and seller are paying is trading fees which is 0.1% of the total amount of the Trade 
    buyerWallet.usd_balance -= (tradeAmount * buyOrder.price) * 1.001;
    sellerWallet.usd_balance += (tradeAmount * sellOrder.price) * 0.999;


    //find buyer wallet cryptocurrency
    const buyerWalletCryptocurrency = await WalletCryptocurrency.findOne({
        cryptocurrency_id: cryptocurrencyId,
        wallet_id: buyerWallet._id
    })

    //find seller wallet cryptocurrency
    const sellerWalletCryptocurrency = await WalletCryptocurrency.findOne({
        cryptocurrency_id: cryptocurrencyId,
        wallet_id: sellerWallet._id
    })

    //If buyer do not have a cryptocurrency wallet for this cryptocurrency, create one
    if(!buyerWalletCryptocurrency) {
        try{
            buyerWalletCryptocurrency = await WalletCryptocurrency.create({
                cryptocurrency_amount: 0,
                wallet_id: buyOrder.user_id,
                cryptocurrency_id: cryptocurrencyId
            })
        }catch{
            throw new Error("Could not create cryptocurrency wallet for user! Try again!");
        }

    }
    //If seller do not have cryptocurrency wallet for this cryptocurrency, then how can he sell!
    if(!sellerWalletCryptocurrency) {
        throw new Error("Cryptocurrency Wallet not found for seller!");
    }

    //Check if seller has enough tokens
    if(sellerWalletCryptocurrency.cryptocurrency_amount > tradeAmount) {
        throw new Error("Insufficient balance for seller!");
    }

    //Update the seller wallet balance
    sellerWalletCryptocurrency.cryptocurrency_amount -= tradeAmount;
    await sellerWalletCryptocurrency.save();

    //Update the buyer wallet balance
    buyerWalletCryptocurrency.cryptocurrency_amount += tradeAmount;
    await buyerWalletCryptocurrency.save();

    //Update the buy order
    buyOrder.amount += tradeAmount;

    if(buyOrder.amount === 0) {
        buyOrder.status = "filled";
    }

    await buyOrder.save();

    //Update the sell order
    sellOrder.amount -= tradeAmount;

    if(sellOrder.amount === 0) {
        sellOrder.status = "filled";
    }
    await sellOrder.save();

    //Update the trade
    const trade = await Trade.create({
        cryptocurrency_id: cryptocurrencyId,
        buyer_id: buyOrder.user_id,
        seller_id: sellOrder.user_id,
        amount: tradeAmount,
        price: sellOrder.price,
        created_at: new Date(),
    });

    await trade.save();
    buyOrder.trades.push(trade._id);
    sellOrder.trades.push(trade._id);
    await buyOrder.save();
    await sellOrder.save();

      // Update cryptocurrency price
    const cryptocurrency = await Cryptocurrency.findById(cryptocurrencyId);
    if (cryptocurrency) {
        cryptocurrency.current_price = tradePrice; // Update current price
        await cryptocurrency.save();
    } 
    
    console.log(`Executed trade: ${tradeAmount} @ ${tradePrice}`);

}