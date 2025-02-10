// const seed = async () => {
// 	const User = require("./models/userModel");
// 	const Cryptocurrency = require("./models/cryptocurrencyModel");
// 	const Wallets = require("./models/walletModel");
// 	const Trade = require("./models/tradeModel");
// 	const WalletCryptocurrency = require("./models/walletCryptocurrencyModel")

// 	const seedData = [
// 		{
// 			username: "johndoe",
// 			email: "johndoe@example.com",
// 			phone_number: "099-999-9999",
// 			created_at: new Date(),
// 			updated_at: new Date(),
// 		},
// 		{
// 			username: "janedoe",
// 			email: "janedoe@example.com",
// 			phone_number: "088-888-8888",
// 			created_at: new Date(),
// 			updated_at: new Date(),
// 		},
// 	];

// 	const cryptocurrencies = [
// 		{
// 			"name": "Bitcoin",
// 			"symbol": "BTC",
// 			"current_price": 50000
// 		},
// 		{
// 			"name": "Ethereum",
// 			"symbol": "ETH",
// 			"current_price": 4000
// 		},
// 		{
// 			"name": "Tether",
// 			"symbol": "USDT",
// 			"current_price": 1
// 		},
// 		{
// 			"name": "Ripple",
// 			"symbol": "XRP",
// 			"current_price": 1.5
// 		},
// 		{
// 			"name": "Litecoin",
// 			"symbol": "LTC",
// 			"current_price": 150
// 		}
// 	]

// 	try {
// 		await User.deleteMany({});
// 		await Cryptocurrency.deleteMany({});
// 		await Wallets.deleteMany({});
// 		await Trade.deleteMany({});
// 		await WalletCryptocurrency.deleteMany({});
		
// 		// บันทึกข้อมูลผู้ใช้
// 		await User.insertMany(seedData);

// 		// บันทึกข้อมูลสกุลเงินดิจิทัล
// 		await Cryptocurrency.insertMany(cryptocurrencies);

// 		const users = await User.find();

// 		// Wallets
// 		const wallets = [
// 			{
// 				balance: 200000,
// 				user_id: users[0]._id,
// 			},
// 			{
// 				balance: 300000,
// 				user_id: users[1]._id,
// 			},
// 		];

// 		await Wallets.insertMany(wallets);

// 		const walletId = await Wallets.find();
// 		const cryptocurrency = await Cryptocurrency.find();

// 		// trade
// 		const trades = [
// 			{
// 				type: "buy",
// 				amount: 0.0234,
// 				price: 0.234,
// 				source_wallet_id: walletId[0]._id,
// 				destination_wallet_id: walletId[1]._id,
// 				cryptocurrency_id: cryptocurrency[0]._id,
// 			},
// 			{
// 				type: "sell",
// 				amount: 0.0325,
// 				price: 0.325,
// 				source_wallet_id: walletId[1]._id,
// 				destination_wallet_id: walletId[0]._id,
// 				cryptocurrency_id: cryptocurrency[2]._id,
// 			},
// 		];

// 		await Trade.insertMany(trades);

// 		// walletCryptocurrency
// 		const walletCryptocurrencies = [
// 			{
// 				"cryptocurrency_amount": 2.5,
// 				"wallet_id": walletId[0]._id,
// 				"cryptocurrency_id": cryptocurrency[1]._id
// 			},
// 			{
// 				"cryptocurrency_amount": 3.2,
// 				"wallet_id": walletId[0]._id,
// 				"cryptocurrency_id": cryptocurrency[2]._id
// 			},
// 			{
// 				"cryptocurrency_amount": 1.0,
// 				"wallet_id": walletId[1]._id,
// 				"cryptocurrency_id": cryptocurrency[4]._id
// 			},
// 			{
// 				"cryptocurrency_amount": 2.0,
// 				"wallet_id": walletId[1]._id,
// 				"cryptocurrency_id": cryptocurrency[3]._id
// 			}
// 		]
		
// 		await WalletCryptocurrency.insertMany(walletCryptocurrencies);

// 		console.log("complete run seed...")
// 	} catch (error) {
// 		console.error("เกิดข้อผิดพลาดในการลบหรือสร้างข้อมูล:", error);
// 	}
// };

// // module.exports = seed;
// seed();  
