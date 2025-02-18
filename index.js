//index.js
const express = require("express");
const connectWithRetry = require("./config/database");
// const seed = require("./seed");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-docs/swagger.json");
const cors = require('cors');

const userRoute = require("./routes/userRoute");
const orderRoute = require("./routes/orderRoute");
const walletRoute = require("./routes/walletRoute");
const depositRoute = require("./routes/depositRoutes")
// const priceUpdater = require('./services/priceUpdater');
const tradeRoute = require("./routes/tradeRoute");
const cryptocurrencyRoute = require("./routes/cryptocurrencyRoute");



const app = express();
const port = process.env.PORT || 3000;



app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
connectWithRetry();
// seed(); 

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res) => {
	// #swagger.tags = ["Testing"]
	// #swagger.summary = "Test API"
	// #swagger.description = "Test API before use another."
	res.send("<h1>Hello World!!!</h1>");
});

app.use("/api/v1/deposits", depositRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/wallets", walletRoute);
app.use("/api/v1/trades", tradeRoute);
app.use("/api/v1/cryptocurrencies", cryptocurrencyRoute);

// Start price updater
// priceUpdater.updatePrices();

app.listen(port, () => {
	console.log(`Start server port: ${port}`);
});
