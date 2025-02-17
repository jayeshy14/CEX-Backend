// const mongoose = require("mongoose");
// const {
//     MONGO_USER,
//     MONGO_PASSWORD,
//     MONGO_PORT,
//     MONGO_IP,
// } = require("./config");

// const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
const mongoose = require('mongoose');
require('dotenv').config();
// Get the MongoDB URI from environment variables
const mongoURL = process.env.MONGO_URI;

let retryAttempts = 0;  // Count the number of retries
const maxRetries = 5;   // Max retries before giving up

const connectWithRetry = async () => {
    if (!mongoURL) {
        console.error("❌ MongoDB URI is not defined in the environment variables.");
        return;
    }

    try {
        // Try connecting to the MongoDB database
        await mongoose.connect(mongoURL);
        console.log("✅ Successfully connected to MongoDB");
        retryAttempts = 0;  // Reset retry count on successful connection
    } catch (error) {
        // If there’s an error, log it and retry after 5 seconds
        console.error("❌ MongoDB Connection Error:", error.message);
        if (retryAttempts < maxRetries) {
            retryAttempts++;
            console.log(`Retrying connection in 5 seconds... Attempt ${retryAttempts}/${maxRetries}`);
            setTimeout(connectWithRetry, 5000); // Retry every 5 seconds
        } else {
            console.error("❌ Max retry attempts reached. Could not connect to MongoDB.");
        }
    }
};

module.exports = connectWithRetry;
